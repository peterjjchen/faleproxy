const request = require('supertest');
const cheerio = require('cheerio');
const { sampleHtmlWithYale } = require('./test-utils');
const nock = require('nock');
const express = require('express');
const axios = require('axios');
const path = require('path');

// Create a test app instance
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '..', 'public')));
  
  // Copy the routes from the main app
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
  
  app.post('/fetch', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const response = await axios.get(url);
      const html = response.data;

      const $ = cheerio.load(html);
      
      $('body *').contents().filter(function() {
        return this.nodeType === 3;
      }).each(function() {
        const text = $(this).text();
        const newText = text.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale');
        if (text !== newText) {
          $(this).replaceWith(newText);
        }
      });
      
      const title = $('title').text().replace(/Yale/g, 'Fale').replace(/yale/g, 'fale');
      $('title').text(title);
      
      return res.json({ 
        success: true, 
        content: $.html(),
        title: title,
        originalUrl: url
      });
    } catch (error) {
      console.error('Error fetching URL:', error.message);
      return res.status(500).json({ 
        error: `Failed to fetch content: ${error.message}` 
      });
    }
  });
  
  return app;
}

let app;

describe('Integration Tests', () => {
  beforeAll(() => {
    // Create test app instance
    app = createTestApp();
    
    // Mock external HTTP requests
    nock.disableNetConnect();
    nock.enableNetConnect();
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test('Should replace Yale with Fale in fetched content', async () => {
    // Setup mock for example.com
    nock('https://example.com')
      .get('/')
      .reply(200, sampleHtmlWithYale);
    
    // Make a request to our proxy app
    const response = await request(app)
      .post('/fetch')
      .send({ url: 'https://example.com/' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verify Yale has been replaced with Fale in text
    const $ = cheerio.load(response.body.content);
    expect($('title').text()).toBe('Fale University Test Page');
    expect($('h1').text()).toBe('Welcome to Fale University');
    expect($('p').first().text()).toContain('Fale University is a private');
    
    // Verify URLs remain unchanged
    const links = $('a');
    let hasYaleUrl = false;
    links.each((i, link) => {
      const href = $(link).attr('href');
      if (href && href.includes('yale.edu')) {
        hasYaleUrl = true;
      }
    });
    expect(hasYaleUrl).toBe(true);
    
    // Verify link text is changed
    expect($('a').first().text()).toBe('About Fale');
  });

  test('Should handle invalid URLs', async () => {
    const response = await request(app)
      .post('/fetch')
      .send({ url: 'not-a-valid-url' });
    
    expect(response.status).toBe(500);
  });

  test('Should handle missing URL parameter', async () => {
    const response = await request(app)
      .post('/fetch')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('URL is required');
  });
});

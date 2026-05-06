import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.toString());
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Click "Add Habit" button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent.includes('Add Habit') || b.textContent.includes('Create a Habit'));
      if (addBtn) addBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Select type "COMPOSITE"
    await page.evaluate(() => {
      // Find the select trigger for Type. It's the first select trigger.
      const selects = Array.from(document.querySelectorAll('[role="combobox"]'));
      // The Type select is usually the first one before Frequency
      if (selects[0]) selects[0].click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    await page.evaluate(() => {
      // Click the "Multi-step habit" option
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      const compositeOpt = options.find(o => o.textContent.includes('Multi-step'));
      if (compositeOpt) compositeOpt.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
  } catch (e) {
    console.error('SCRIPT ERR:', e);
  } finally {
    await browser.close();
  }
})();

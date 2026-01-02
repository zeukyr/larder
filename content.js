(() => {

    function durationToMinutesHelper(str) {
        if (!str || typeof str !== 'string') return 0;
        
        const match = str.trim().match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
        if (!match) return 0;
      
        const hours = Number(match[1] || 0);
        const minutes = Number(match[2] || 0);
      
        return hours * 60 + minutes;
    }

    function durationToMinutes(prepTime, cookTime) {
        const prepMinutes = durationToMinutesHelper(prepTime);
        const cookMinutes = durationToMinutesHelper(cookTime);
        return prepMinutes + cookMinutes;
    }

    function parseJSONLD() {
      console.log("🔍 Searching for JSON-LD...");
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');      
      console.log("Found", scripts.length, "JSON-LD scripts");
      
      let recipe = null;
  
      scripts.forEach((script, index) => {
        try {
          const data = JSON.parse(script.textContent);
          console.log(`Script ${index} parsed successfully`);
          
          // Handle both single objects and arrays
          const items = Array.isArray(data) ? data : [data];
  
          items.forEach((item) => {
            // Direct Recipe type
            if (item['@type'] === 'Recipe') {
              console.log("✅ Found Recipe in JSON-LD!");
              recipe = item;
            }
            // Recipe in @graph
            if (item['@graph']) {
              item['@graph'].forEach((graphItem) => {
                if (graphItem['@type'] === 'Recipe') {
                  console.log("✅ Found Recipe in @graph!");
                  recipe = graphItem;
                }
              });
            }
          });
        } catch (e) {
          console.log("❌ Invalid JSON-LD in script", index, ":", e);
        }
      });

      if (recipe) {
        console.log("📋 Recipe data:", {
          name: recipe.name,
          ingredients: recipe.recipeIngredient?.length || 0,
          instructions: recipe.recipeInstructions?.length || 0
        });
      }
  
      return recipe;
    }
  
    function scrapeDOM() {
      console.log("🔍 Attempting DOM scraping...");
      
      const ingredients = [];
      const instructions = [];

      const ingredientSelectors = [
        'ul.ingredients-list li',
        'ul[class*="ingredient"] li',
        '.ingredient-lists li',
        'li[class*="ingredient"]',
        '[itemprop="recipeIngredient"]'
      ];
      
      for (const selector of ingredientSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(el => {
            const text = el.textContent.trim();
            if (text && !ingredients.includes(text)) {
              ingredients.push(text);
            }
          });
          break; // Stop after first successful selector
        }
      }

      const instructionSelectors = [
        'ol.directions-list li',
        'ol[class*="instruction"] li',
        'ol[class*="direction"] li',
        '.instructions li',
        'li[class*="instruction"]'
      ];
      
      for (const selector of instructionSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(el => {
            const text = el.textContent.trim();
            if (text && !instructions.includes(text)) {
              instructions.push(text);
            }
          });
          break;
        }
      }


      if (ingredients.length === 0 && instructions.length === 0) {
        return null;
      }

      return { 
        title: document.querySelector('h1')?.textContent.trim() || 'Untitled Recipe',
        ingredients, 
        instructions,
        totalTime: 0,
        servings: '',
        image: document.querySelector('meta[property="og:image"]')?.content || ''
      };
    }
  
    function parseRecipe() {
      console.log("🚀 Starting parseRecipe...");
      
      // Try JSON-LD first
      const recipe = parseJSONLD();
      if (recipe && recipe.recipeIngredient && recipe.recipeIngredient.length > 0) {
        console.log("✅ Using JSON-LD data");
        
        const prepTime = recipe.prepTime || '';
        const cookTime = recipe.cookTime || '';
        const totalMinutes = recipe.totalTime
          ? durationToMinutesHelper(recipe.totalTime)
          : durationToMinutes(prepTime, cookTime);
        
        // Handle image - could be string, object, or array
        let imageUrl = '';
        if (typeof recipe.image === 'string') {
          imageUrl = recipe.image;
        } else if (recipe.image && recipe.image.url) {
          imageUrl = recipe.image.url;
        } else if (Array.isArray(recipe.image) && recipe.image.length > 0) {
          imageUrl = typeof recipe.image[0] === 'string' ? recipe.image[0] : recipe.image[0]?.url || '';
        }
        
        // Parse instructions - handle HowToStep objects
        let instructions = [];
        if (Array.isArray(recipe.recipeInstructions)) {
          instructions = recipe.recipeInstructions.map(inst => {
            if (typeof inst === 'string') return inst;
            if (inst.text) return inst.text;
            if (inst['@type'] === 'HowToStep' && inst.text) return inst.text;
            return '';
          }).filter(Boolean);
        }
        
        return {
          title: recipe.name || '',
          ingredients: recipe.recipeIngredient || [],
          instructions: instructions,
          prepTime: prepTime,
          cookTime: cookTime,
          totalTime: totalMinutes,
          servings: String(recipe.recipeYield || ''),
          image: imageUrl,
          mealType: ''
        };
      }
  
      // Fallback to DOM scraping
      const domData = scrapeDOM();
      if (domData) {
        return domData;
      }
  
      return null;
    }
  
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {      
      if (request.action === 'parseRecipe') {        
        try {
          const parsedRecipe = parseRecipe();
          
          if (parsedRecipe) {
            sendResponse({ success: true, recipe: parsedRecipe });
          } else {
            sendResponse({ success: false, error: "Could not find recipe on this page" });
          }
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      }
      
      return true; 
    });
})();
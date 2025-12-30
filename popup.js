document.addEventListener("DOMContentLoaded", () => {
    const home = document.getElementById("main");
    const addRecipe = document.getElementById("add-recipe");
    const mealPrep = document.getElementById("meal-prep");
    const defaultImg = 'icons/pantry16.png';
  
    const addBtn = document.getElementById("add");
    const mealPrepBtn = document.getElementById("meal-prep-btn");
    const backBtn = document.getElementById("back");
    const backFromPrepBtn = document.getElementById("back-from-prep");
    const autofillBtn = document.getElementById("autofill");
    const suggestRecipeBtn = document.getElementById("suggest-recipe-btn");

    const form = document.querySelector("form");
    const submitBtn = document.getElementById("add-recipe-btn");
    // Tab switching functionality
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all links
            tabLinks.forEach(l => l.classList.remove('active'));
            
            // Add active to clicked link
            link.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show the target tab
            const targetTab = link.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
            
            // If switching to recipes tab, render recipes
            if (targetTab === 'recipe-list-tab') {
                renderRecipes();
            }
        });
    });
    
    async function getUnsplashImg(title) {
        try {
            const accessKey = "tuqbizgfJc7QMF2ZkyFS4ZIAWRdgmv-I7MCWI3dAwKQ";
                
            if (!accessKey) {
                console.error("No Unsplash API key found in manifest");
                return null;
            }
    
            console.log("Searching Unsplash for:", title);
            
            const query = encodeURIComponent(title);
            const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${accessKey}`;
        
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error("Unsplash API error:", response.status, response.statusText);
                return null;
            }
            
            const data = await response.json();
            console.log("Unsplash response:", data);
        
            if (data.results && data.results.length > 0) {
                return data.results[0].urls.regular; 
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching image from Unsplash:", error);
            return null;
        }
    }

    function renderRecipes() {
        const recipeList = document.getElementById("recipe-list");
        recipeList.innerHTML = ""; 
      
        chrome.storage.local.get({ recipes: [] }, (result) => {
            const recipes = result.recipes;
      
            if (recipes.length === 0) {
                recipeList.textContent = "No recipes saved yet.";
                return;
            }
      
            recipes.forEach((recipe, index) => {
                const card = document.createElement("div");
                card.className = "recipe-card";
      
                card.innerHTML = `
                <button class="delete-btn" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                        <path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2h3.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1H14.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0 0 1H13.5a.5.5 0 0 0 0-1H2.5z"/>
                    </svg>
                </button>

                <button class="toggle-btn">See Details</button>
                <div class="summary active">
                    <h3>${recipe.title}</h3>
                    <p>Time: ${recipe.time}</p>
                    <img src="${recipe.image || defaultImg}" alt="${recipe.title}" />
                </div> 
                <div class="details">
                    <h3>${recipe.title}</h3>
                    <p>Ingredients:</p>
                    <ul>
                        ${recipe.ingredients.split('\n').map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                    <p>Instructions:</p>
                    <ol>
                        ${recipe.instructions.split('\n').map(inst => `<li>${inst}</li>`).join('')}
                    </ol>
                </div>
                `;
                
                const deleteBtn = card.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => {
                    if (confirm(`Delete "${recipe.title}"?`)) {
                        chrome.storage.local.get({ recipes: [] }, (result) => {
                            const updatedRecipes = result.recipes;
                            updatedRecipes.splice(index, 1);
                            
                            chrome.storage.local.set({ recipes: updatedRecipes }, () => {
                                renderRecipes();
                            });
                        });
                    }
                });

                const toggleBtn = card.querySelector('.toggle-btn');
                toggleBtn.addEventListener('click', () => {
                    const detailsDiv = card.querySelector('.details');
                    const summaryDiv = card.querySelector('.summary');
                    if (detailsDiv.classList.contains('active')) {
                        detailsDiv.classList.remove('active');
                        summaryDiv.classList.add('active');
                        toggleBtn.textContent = "See Details";
                    } else {
                        detailsDiv.classList.add('active');
                        summaryDiv.classList.remove('active');
                        toggleBtn.textContent = "Back";
                    }
                });

                recipeList.appendChild(card);
            });
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const recipe = {
                title: document.getElementById("recipe-name").value,
                time: document.getElementById("time").value,
                servings: document.getElementById("servings").value,
                mealType: document.getElementById("meal-type").value,
                ingredients: document.getElementById("ingredients").value,
                instructions: document.getElementById("instructions").value,
                image: document.getElementById("recipe-image")?.src || defaultImg,
            };
            
            chrome.storage.local.get({ recipes: [] }, (result) => {
                const recipes = result.recipes;
                recipes.push(recipe);
          
                chrome.storage.local.set({ recipes }, () => {
                    console.log("Recipe saved!");
                    form.reset();
                    document.getElementById("recipe-image").src = defaultImg;
                    
                    addRecipe.classList.remove("active");
                    mealPrep.classList.add("active");
                    renderRecipes();
                });
            });       
        });
    }

    if (addBtn && home && addRecipe) {
        addBtn.addEventListener("click", () => {
            home.classList.remove("active");
            addRecipe.classList.add("active");
        });
    }

    if (suggestRecipeBtn) {
        suggestRecipeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            
            console.log("🔍 Suggest Recipe button clicked!");
            
            const preferences = {
                time: document.getElementById("time-to-allocate").value,
                type: document.getElementById("preferred-meal-type").value,
                ingredients: document.getElementById("ingredients-on-hand").value,
            };
            
            console.log("📋 User preferences:", preferences);
            
            chrome.storage.local.set({ preferences }, () => {
                console.log("💾 Preferences saved!");
                matchAndDisplayRecipes(preferences);
            });
        });
    }
    
    function matchAndDisplayRecipes(preferences) {
        console.log("🔄 Starting matchAndDisplayRecipes...");
        
        chrome.storage.local.get({ recipes: [] }, (result) => {
            const recipes = result.recipes;
            console.log("📚 Total recipes in storage:", recipes.length);
            
            if (recipes.length === 0) {
                console.warn("⚠️ No recipes found in storage!");
                displayMatchedRecipes([]);
                return;
            }
            
            const matches = findMatchingRecipes(recipes, preferences);
            console.log("✅ Found", matches.length, "matching recipes");
            displayMatchedRecipes(matches);
        });
    }
    
    function findMatchingRecipes(recipes, preferences) {
        const maxTime = parseInt(preferences.time) || Infinity;
        const preferredType = preferences.type.toLowerCase().trim();
        const userIngredients = preferences.ingredients
            .toLowerCase()
            .split('\n')
            .map(i => i.trim())
            .filter(i => i.length > 0);
        
        console.log("🔍 Filtering with:", { 
            maxTime, 
            preferredType, 
            userIngredientsCount: userIngredients.length 
        });
        
        const results = recipes
            .map((recipe, index) => {
                console.log(`\n--- Recipe ${index + 1}: ${recipe.title} ---`);
                
                const recipeTime = parseInt(recipe.time) || 0;
                const recipeMealType = (recipe.mealType || '').toLowerCase().trim();
                
                console.log(`⏱️ Time: ${recipeTime} minutes (max: ${maxTime})`);
                console.log(`🍽️ Meal type: "${recipeMealType}" (preferred: "${preferredType}")`);
                
                // HARD FILTER 1: Time
                if (recipeTime > maxTime) {
                    console.log(`❌ Filtered out: time ${recipeTime} > ${maxTime}`);
                    return null; 
                }
                
                // HARD FILTER 2: Meal type
                // Only filter if user specified a type AND it's not "any" AND recipe has a type that doesn't match
                if (preferredType && preferredType !== 'any' && preferredType !== '') {
                    if (recipeMealType && recipeMealType !== preferredType) {
                        console.log(`❌ Filtered out: meal type "${recipeMealType}" doesn't match "${preferredType}"`);
                        return null; 
                    }
                }
                
                // SOFT FILTER: Ingredients
                const recipeIngredients = recipe.ingredients
                    .toLowerCase()
                    .split('\n')
                    .map(i => i.trim())
                    .filter(i => i.length > 0);
                
                console.log(`🥘 Recipe has ${recipeIngredients.length} ingredients`);
                
                const ingredientScore = calculateIngredientMatch(
                    userIngredients, 
                    recipeIngredients
                );
                
                console.log(`✅ Match score: ${ingredientScore.score}%`);
                console.log(`✅ Matched: ${ingredientScore.matched.length}, Missing: ${ingredientScore.missing.length}`);
                
                return {
                    ...recipe,
                    matchScore: ingredientScore.score,
                    matchedIngredients: ingredientScore.matched,
                    missingIngredients: ingredientScore.missing,
                    totalIngredients: recipeIngredients.length
                };
            })
            .filter(recipe => recipe !== null);
        
        const sorted = results.sort((a, b) => b.matchScore - a.matchScore);
        console.log("\n📊 Final results:", sorted.length, "recipes passed filters");
        
        return sorted;
    }
    
    function calculateIngredientMatch(userIngredients, recipeIngredients) {
        const matched = [];
        const missing = [];
        
        const staples = ['salt', 'pepper', 'water', 'oil', 'olive oil', 'vegetable oil'];
        
        recipeIngredients.forEach(recipeIng => {
            const isMatched = userIngredients.some(userIng => {
                return recipeIng.includes(userIng) || userIng.includes(recipeIng);
            });
            
            if (isMatched) {
                matched.push(recipeIng);
            } else {
                const isStaple = staples.some(staple => recipeIng.includes(staple));
                if (!isStaple) {
                    missing.push(recipeIng);
                }
            }
        });
        
        const totalNonStaple = recipeIngredients.filter(ing => 
            !staples.some(staple => ing.includes(staple))
        ).length;
        
        const matchPercentage = totalNonStaple > 0 
            ? (matched.length / totalNonStaple) * 100 
            : 100;
        
        return {
            score: Math.round(matchPercentage),
            matched: matched,
            missing: missing
        };
    }
    
    function displayMatchedRecipes(matches) {
        console.log("🎨 displayMatchedRecipes called with", matches.length, "recipes");
        
        const resultsContainer = document.getElementById("recipe-suggestions");
        
        if (!resultsContainer) {
            console.error("❌ No element with id='recipe-suggestions' found!");
            console.log("Available elements:", document.querySelectorAll('[id*="suggestion"]'));
            return;
        }
        
        console.log("✅ Found results container:", resultsContainer);
        
        resultsContainer.innerHTML = "";
        
        if (matches.length === 0) {
            console.log("ℹ️ No matches, showing empty state");
            resultsContainer.innerHTML = `
                <p style="text-align: center; color: #666; padding: 20px;">
                    No recipes match your criteria. Try adjusting your time or meal type preferences.
                </p>
            `;
            return;
        }
        
        console.log("✅ Rendering", matches.length, "recipe cards");
        
        matches.forEach((recipe, index) => {
            const card = document.createElement("div");
            card.className = "recipe-card suggestion-card";
            
            const matchBadge = recipe.matchScore >= 80 ? '🌟' : 
                              recipe.matchScore >= 60 ? '✓' : '○';
            
            card.innerHTML = `
                <div class="summary active">
                    <h3>${recipe.title} ${matchBadge}</h3>
                    <p><strong>Match Score:</strong> ${recipe.matchScore}%</p>
                    <p><strong>Time:</strong> ${recipe.time}</p>
                    <p><strong>Matched Ingredients:</strong> ${recipe.matchedIngredients.length}/${recipe.totalIngredients}</p>
                    ${recipe.missingIngredients.length > 0 ? `
                        <details style="margin-top: 10px;">
                            <summary style="cursor: pointer; color: #ff6b6b;">
                                Missing ${recipe.missingIngredients.length} ingredient(s)
                            </summary>
                            <ul style="margin: 10px 0; padding-left: 20px; font-size: 0.9em;">
                                ${recipe.missingIngredients.map(ing => `<li>${ing}</li>`).join('')}
                            </ul>
                        </details>
                    ` : '<p style="color: #51cf66;">✓ You have all ingredients!</p>'}
                    <img src="${recipe.image || 'icons/pantry16.png'}" alt="${recipe.title}" />
                </div>
            `;
            
            console.log(`✅ Added card ${index + 1}:`, recipe.title);
            resultsContainer.appendChild(card);
        });
        
        console.log("✅ All cards rendered successfully!");
    }
    
    if (backBtn && home && addRecipe) {
        backBtn.addEventListener("click", () => {
            addRecipe.classList.remove("active");
            home.classList.add("active");
        });
    }

    if (backFromPrepBtn && mealPrep && home) {
        backFromPrepBtn.addEventListener("click", () => {
            mealPrep.classList.remove("active");
            home.classList.add("active");
        });
    }

    if (mealPrepBtn && home && mealPrep) {
        mealPrepBtn.addEventListener("click", () => {
            home.classList.remove("active");
            mealPrep.classList.add("active");
            renderRecipes();
        });
    }
    
    if (autofillBtn) {
        autofillBtn.addEventListener("click", async () => {
            autofillBtn.textContent = "Parsing...";
            autofillBtn.disabled = true;
            
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                
                chrome.tabs.sendMessage(tab.id, { action: 'parseRecipe' }, async (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error:", chrome.runtime.lastError);
                        alert('Could not access page. Try refreshing the recipe page first.');
                        autofillBtn.textContent = "Autofill";
                        autofillBtn.disabled = false;
                        return;
                    }
                                        
                    if (response && response.success) {
                        document.getElementById('recipe-name').value = response.recipe.title || '';
                        document.getElementById('time').value = `${response.recipe.totalTime} minutes` || '';
                        document.getElementById('ingredients').value = response.recipe.ingredients.join('\n');
                        document.getElementById('instructions').value = response.recipe.instructions.join('\n');
                        document.getElementById('servings').value = response.recipe.servings || '';
                        document.getElementById('meal-type').value = response.recipe.mealType || '';
                        
                        let imageUrl = response.recipe.image;
                        if (!imageUrl) {
                            imageUrl = await getUnsplashImg(response.recipe.title);
                        }
                        if (imageUrl) {
                            document.getElementById('recipe-image').src = imageUrl;
                        }

                        autofillBtn.textContent = "✓ Filled!";
                    } else {
                        alert(response?.error || 'Could not parse recipe');
                        autofillBtn.textContent = "Autofill";
                    }
                    autofillBtn.disabled = false;
                });
            } catch (error) {
                console.error("Exception:", error);
                alert('Error: ' + error.message);
                autofillBtn.textContent = "Autofill";
                autofillBtn.disabled = false;
            }
        });
    }
});
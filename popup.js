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
    const planAheadBtn = document.getElementById("plan-ahead-btn")
    const searchInput = document.getElementById("recipe-search");

    const form = document.querySelector('#add-recipe-form');
    const submitBtn = document.getElementById("add-recipe-btn");
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

    function renderRecipes(recipesToRender) {
        const recipeList = document.getElementById("recipe-list");
        recipeList.innerHTML = ""; 

        
        if (!recipesToRender) {
            chrome.storage.local.get({ recipes: [] }, (result) => {
                renderRecipes(result.recipes);
            })
            return;
        }
                
        
        else if (recipesToRender.length === 0) {
            recipeList.textContent = "No recipes saved yet.";
            return;
        }
        
        recipesToRender.forEach((recipe, index) => {
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
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            chrome.storage.local.get({ recipes: [] }, (result) => {
                const filtered = result.recipes.filter(r =>
                    r.title.toLowerCase().includes(query)
                );
                renderRecipes(filtered); 
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


    if (suggestRecipeBtn) {
        suggestRecipeBtn.addEventListener("click", (e) => {
            e.preventDefault();            
            const preferences = {
                time: document.getElementById("time-to-allocate").value,
                type: document.getElementById("preferred-meal-type").value,
                ingredients: document.getElementById("ingredients-on-hand").value,
            };
                        
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
            
            if (recipes.length === 0) {
                console.warn("⚠️ No recipes found in storage!");
                displayMatchedRecipes([]);
                return;
            }
            
            const matches = findMatchingRecipes(recipes, preferences);
            displayMatchedRecipes(matches);
        });
    }
    
    function findMatchingRecipes(recipes, preferences) {
        const maxTime = parseInt(preferences.time) || Infinity;
        const preferredType = preferences.type.toLowerCase().trim();
        const userIngredients = preferences.ingredients
            .toLowerCase()
            .split(/[\n,]+/)
            .map(i => i.trim())
            .filter(i => i.length > 0);
        ;
        
        const results = recipes
            .map((recipe, index) => {                
                const recipeTime = parseInt(recipe.time) || 0;
                const recipeMealType = (recipe.mealType || '').toLowerCase().trim();
                
                if (recipeTime > maxTime) {
                    return null; 
                }
                
                if (preferredType && preferredType !== 'any' && preferredType !== '') {
                    if (recipeMealType && recipeMealType !== preferredType) {
                        return null; 
                    }
                }
                
                const recipeIngredients = recipe.ingredients
                    .toLowerCase()
                    .split('\n')
                    .map(i => i.trim())
                    .filter(i => i.length > 0);
                                
                const ingredientScore = calculateIngredientMatch(
                    userIngredients, 
                    recipeIngredients
                );
                                
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
        
        const resultsContainer = document.getElementById("recipe-suggestions");
        
        if (!resultsContainer) {
            console.error("No element with id='recipe-suggestions' found!");
            return;
        }
        
        
        resultsContainer.innerHTML = "";
        
        if (matches.length === 0) {
            console.log("No matches, showing empty state");
            resultsContainer.innerHTML = `
                <p style="text-align: center; color: #666; padding: 20px;">
                    No recipes match your criteria. Try adjusting your time or meal type preferences.
                </p>
            `;
            return;
        }
        
        
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
            
            resultsContainer.appendChild(card);
        });
        
    }
    if (addBtn && home && addRecipe) {
        addBtn.addEventListener("click", () => {
            home.classList.remove("active");
            mealPrep.classList.remove("active");
            addRecipe.classList.add("active");
        });
    }

    if (backBtn && home && addRecipe) {
        backBtn.addEventListener("click", () => {
            addRecipe.classList.remove("active");
            mealPrep.classList.remove("active");
            home.classList.add("active");
        });
    }

    if (backFromPrepBtn && mealPrep && home) {
        backFromPrepBtn.addEventListener("click", () => {
            mealPrep.classList.remove("active");
            addRecipe.classList.remove("active");
            home.classList.add("active");
        });
    }

    if (mealPrepBtn && home && mealPrep) {
        mealPrepBtn.addEventListener("click", () => {
            home.classList.remove("active");
            addRecipe.classList.remove("active")
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

    if (planAheadBtn) {
    planAheadBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        planAheadBtn.disabled = true;

        const itemsOnSale = document.getElementById("on-sale").value
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);
        const days = parseInt(document.getElementById("days").value, 10);

        chrome.storage.local.get({ recipes: [] }, async (result) => {
            const recipes = result.recipes;
            const savedRecipes = recipes.map(r => r.title).join(", ");
            try {
                const mealPlan = await generateMealPlan(itemsOnSale, savedRecipes, days);
                console.log(mealPlan)
                const outputDiv = document.getElementById("output");
                const formattedPlan = formatMealPlan(mealPlan)
                outputDiv.style.display = "block";   
                outputDiv.innerHTML = formattedPlan;
            } catch {
                alert('Error generating meal plan. Check console for details.');
            }
    })})}


async function generateMealPlan(itemsOnSale, savedRecipes, days) {
    const apiKey = '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';
    
    if (!Array.isArray(itemsOnSale) || itemsOnSale.length === 0) {
        throw new Error("Please provide items on sale.");
    }

    const prompt = `Create a detailed ${days}-day meal plan for me.

MY SAVED RECIPES:
${savedRecipes}

INGREDIENTS ON SALE THIS WEEK:
${itemsOnSale.join(", ")}

REQUIREMENTS:
- Plan breakfast, lunch, and dinner for each of the ${days} days
- Prioritize using my saved recipes from the list above
- Heavily prioritize the ingredients that are on sale
- Try to reuse ingredients across meals to minimize waste
- Balance nutrition and variety

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

DAY 1
🌅 Breakfast: [Recipe name or meal idea]
☀️ Lunch: [Recipe name or meal idea]
🌙 Dinner: [Recipe name or meal idea]

DAY 2
🌅 Breakfast: [Recipe name or meal idea]
☀️ Lunch: [Recipe name or meal idea]
🌙 Dinner: [Recipe name or meal idea]

[Continue for all ${days} days]

🛒 SHOPPING LIST
Priority items (on sale):
⭐ [sale item 1]
⭐ [sale item 2]

Other ingredients needed:
- [ingredient 1]
- [ingredient 2]
`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.href, 
                "X-Title": "Larder Meal Planner"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.2-3b-instruct:free", 
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenRouter API Error:", errorData);
            
            if (response.status === 401) {
                throw new Error("Invalid API key. Please check your OpenRouter API key.");
            } else if (response.status === 429) {
                throw new Error("Rate limit reached. Please try again in a few minutes.");
            } else if (response.status === 402) {
                throw new Error("Out of credits. Please add credits to your OpenRouter account.");
            } else {
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
        } else {
            throw new Error("Unexpected response format from OpenRouter");
        }
        
    } catch (error) {
        console.error("Error generating meal plan:", error);
        throw error;
    }
}

function formatMealPlan(mealPlanText) {
    const lines = mealPlanText.split("\n").filter(line => line.trim() !== "");

    const dayBlocks = [];
    let currentDay = null;
    let shoppingLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (/^DAY \d+/i.test(line)) {
            currentDay = { title: line.trim(), meals: [] };
            dayBlocks.push(currentDay);
        } else if (/^🛒? ?SHOPPING LIST/i.test(line)) {
            shoppingLines = lines.slice(i); // everything after this line is shopping list
            break;
        } else if (currentDay) {
            // Split multiple meals on the same line
            const mealRegex = /(🌅 Breakfast:|☀️ Lunch:|🌙 Dinner:)/g;
            let match;
            let lastIndex = 0;

            while ((match = mealRegex.exec(line)) !== null) {
                const mealStart = match.index;
                if (lastIndex !== mealStart) {
                    const prevMeal = currentDay.meals[currentDay.meals.length - 1];
                    if (prevMeal) prevMeal.instructions.push(line.substring(lastIndex, mealStart).trim());
                }

                const mealTitle = match[0];
                currentDay.meals.push({ title: mealTitle, instructions: [] });
                lastIndex = mealStart + mealTitle.length;
            }

            // Add remaining text after last meal match
            if (currentDay.meals.length > 0) {
                currentDay.meals[currentDay.meals.length - 1].instructions.push(line.substring(lastIndex).trim());
            } else {
                // No meal title? Just add as instruction
                currentDay.meals.push({ title: "", instructions: [line] });
            }
        }
    }

    // Build HTML for days
    let html = "";
    dayBlocks.forEach(day => {
        html += `<div style="margin-bottom: 15px; padding: 12px; background: rgba(111,100,93,0.4); border-radius: 10px;">`;
        html += `<h3 style="margin-top:0;">${day.title}</h3>`;
        day.meals.forEach(meal => {
            if (meal.title) html += `<p><strong>${meal.title}</strong></p>`;
            meal.instructions.forEach(inst => {
                if (inst) html += `<p style="margin-left: 10px;">${inst}</p>`;
            });
        });
        html += `</div>`;
    });

    // Build HTML for shopping list
    if (shoppingLines.length > 0) {
        const shoppingText = shoppingLines.join("\n");

        const priorityMatch = shoppingText.match(/Priority items \(on sale\):([\s\S]*?)(?=Other ingredients needed:)/i);
        const priorityItems = priorityMatch
            ? priorityMatch[1]
                .split('\n')
                .map(i => i.trim())
                .filter(Boolean)
                .map(i => i.replace(/^[⭐•\-–—]\s*/, '').trim())
                .filter(i => i.length > 0 && !i.match(/^(Priority|Other|Shopping)/i))
            : [];

        const otherMatch = shoppingText.match(/Other ingredients needed:([\s\S]+?)(?=💡|MEAL PREP|$)/i);
        const otherItems = otherMatch
            ? otherMatch[1]
                .split('\n')
                .map(i => i.trim())
                .filter(Boolean)
                .map(i => i.replace(/^[⭐•\-–—]\s*/, '').trim())
                .filter(i => i.length > 0 && !i.match(/^(Priority|Other|Shopping|💡|MEAL PREP)/i))
            : [];
        
        const uniqueOtherItems = [...new Set(otherItems)];

        html += `<div style="margin-bottom: 15px; padding: 12px; background: rgba(143,175,154,0.3); border-radius: 10px;">
                    <h3 style="margin-top:0;">🛒 Shopping List</h3>`;
        
        if (priorityItems.length > 0) {
            html += `<p><strong>Priority items (on sale):</strong></p>
                     <ul style="padding-left: 20px; margin: 5px 0;">
                        ${priorityItems.map(i => `<li>⭐ ${i}</li>`).join("")}
                     </ul>`;
        }
        
        if (uniqueOtherItems.length > 0) {
            html += `<p><strong>Other ingredients needed:</strong></p>
                     <ul style="padding-left: 20px; margin: 5px 0;">
                        ${uniqueOtherItems.map(i => `<li>${i}</li>`).join("")}
                     </ul>`;
        }
        
        html += `</div>`;
    }

    return html;
}
});

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
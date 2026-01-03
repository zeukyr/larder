# Larder

Store your favourite recipes and plan meals!

# Demo

https://github.com/user-attachments/assets/4811939f-674c-458c-bb43-ef451a3794d4

# Project Overview

This is a Google Chrome extension that stores recipes and aids with planning meals. Users can gather recipes they find online, as well as personal recipes, and organize them in one place. It also helps create personalized shopping lists and weekly meal plans from this database of recipes, making cooking easier and more efficient.

# Why I built This

My mom is always complaining about not knowing what to make for dinner, and as I'm starting to learn how to cook for myself in university, I've never understood her struggles more. Meal planning is a hassle, from finding good recipes to planning out what to buy, so I made Larder in an attempt to simplify things. Rather than having to read through dense paragraphs of online recipes, Larder extracts its key aspects: time, ingredients, and steps, and saves them for easy access. It also gives recommendations on which of your recipes to make based on what’s available, or helps you plan ahead for the week using AI.

# Tools and Technologies
Javascript: I chose vanilla JavaScript over frameworks like React to gain a deeper understanding of JavaScript fundamentals, including asynchronous programming with async/await, and managing application state without relying on external libraries. This also kept the extension lightweight and performant, which is important when code runs in users' browsers.

HTML & CSS - I used standard HTML and CSS to build the user interface because again, browser extensions benefit from simplicity and minimal dependencies. This helped me better understand layout techniques like Flexbox for organizing recipe cards and form elements.

Chrome Extensions API (Manifest V3) - I built this as a Chrome extension using Manifest V3, the latest standard, because I needed my product to be able to interact with web pages. The Extensions API taught me how to scrape recipe data from websites using both JSON-LD and DOM-scraping and persist user data. 

OpenRouter API - I integrated the OpenRouter API to leverage AI for generating personalized meal plans. Instead of hard-coding complex rules for nutrition balance, portioning, or leftovers—which would require extensive logic —I delegated that decision-making to an AI model.  This taught me how to handle API authentication, and process AI-generated responses. 

Unsplash API - I integrated the Unsplash API to dynamically fetch high-quality food images for recipes, when grabbing the image from the webpage itself failed or when the user manually typed in a recipe of their own. 

# Features and Implementation
Recipe Saving - Save recipes from any website with a single click while browsing, automatically capturing the recipe name, ingredients, instructions, and a photo for later reference without ever leaving the page or having to copy/paste

Image Generation - Generates a high quality image from Unsplash if no image is shown on the webpage or if manually entering a family recipe.
Recipe Organization - View, search, and manage your collection of saved recipes in one central location with visual thumbnails

Suggest Me - Ask Larder to suggest a recipe based on ingredients available, the amount of time you have, and type of meal (i.e. breakfast, lunch, dinner). 

AI Meal Planning - Generate personalized multi-day meal plans that prioritize your saved recipes and ingredients on sale, with automatic leftover suggestions to minimize food waste. Creates shopping lists based on this generated meal plan

# Key Learnings and Challenges

# Technical Skills

Chrome Extensions Architecture: I learned the difference between content scripts and popup scripts, which was initially confusing. Content scripts run directly on web pages and can access the HTML there, while popup scripts manage the extension’s user interface itself. Understanding their different permissions and limitations helped me decide where each function belonged.

Web Scraping: Extracting recipe data from various websites proved difficult because every site structures their HTML differently. I learned to identify common patterns, such as recipe schema markup, and used DOM-scraping when it failed. 

Prompt Engineering for AI: Crafting effective prompts for the OpenRouter API to generate useful meal plans was difficult. I learned that AI models need very specific instructions to produce the results that I intended. 

Asynchronous JavaScript & API Integration: I learned to coordinate calls to the Unsplash API for images, OpenRouter API for meal planning, and Chrome Storage API for data persistence. Learning how to use async/await allowed me to ensure that the UI remained interactive while slow tasks performed in the background.

# Soft Skills

Feature Prioritization: I initially wanted to add many ambitious features (nutrition tracking, PDF parsing of grocery store flyers), but learned to focus on core functionality first. Getting recipe saving and basic meal planning working well was more valuable than having many half-finished features. This taught me about MVP (Minimum Viable Product) thinking. Additionally, I realized that manually entering items on sale was much simpler than parsing a PDF while providing nearly the same practical benefit. 

Research: Building a browser extension required learning technologies not typically covered in standard web development tutorials. I had to read Chrome's official documentation and piece together solutions from multiple sources. This improved my ability to learn independently and navigate technical documentation.

Attention to Detail: Small details mattered enormously—a missing await or div-tag, or a CSS margin being off by a few pixels could break functionality. I developed the habit of reviewing and testing my code more frequently before moving on in order to isolate the cause of any potential bugs. 


Installation and Setup
1. Clone the project
git clone https://github.com/zeukyr/larder.git

2.Navigate to project directory
cd larder

3.Install dependencies
npm install

4.Open Chrome and go to Extensions: chrome://extensions/

5.Enable "Developer mode"

6.Click "Load unpacked" and select the project folder. The Larder extension icon should now appear in your browser toolbar!


# Future Improvements

Meal Plan Export: Allow users to export their meal plans as PDFs or send them via email for easy printing or sharing with family members. 

Nutrition Tracking:  Calculate calories and nutritional information for each meal plan. This would help users make informed decisions about balanced eating and dietary goals.

Smart Ingredient Substitutions: When a user is missing something, recognize if the user has an ingredient that can act as a substitute as part of the Suggest Me feature.  

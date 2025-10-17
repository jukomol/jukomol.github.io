---
layout: default
title: Blog
permalink: /blog/
description: Blog posts and articles
---

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Blog Posts</h1>
  
  <!-- Search and Filter Controls -->
  <div class="mb-8 space-y-4">
    <!-- Search Box -->
    <div class="max-w-2xl">
      <input 
        type="text" 
        id="search-input" 
        placeholder="Search posts by title, author, or tags..." 
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
    </div>
    
    <!-- Tag Filter -->
    <div id="tag-filter" class="flex flex-wrap gap-2">
      <!-- Tags will be populated by JavaScript -->
    </div>
  </div>
  
  <!-- Posts List -->
  <div id="posts-list" class="space-y-8">
    {% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" | sort: "name" | reverse %}
    
    {% if posts_by_year.size > 0 %}
      {% for year_group in posts_by_year %}
        <section class="year-group" data-year="{{ year_group.name }}">
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-primary-500 pb-2">
            {{ year_group.name }}
          </h2>
          
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {% assign sorted_posts = year_group.items | sort: 'date' | reverse %}
            {% for post in sorted_posts %}
              {% include card.html item=post type="post" %}
            {% endfor %}
          </div>
        </section>
      {% endfor %}
    {% else %}
      <div class="text-center py-12">
        <p class="text-gray-600 text-lg">No blog posts yet. Check back soon!</p>
      </div>
    {% endif %}
  </div>
  
  <!-- No Results Message -->
  <div id="no-results" class="hidden text-center py-12">
    <p class="text-gray-600 text-lg">No posts found matching your search.</p>
  </div>
</div>

<script src="{{ '/assets/js/filter.js' | relative_url }}"></script>
<script>
  // Initialize filtering for blog posts
  document.addEventListener('DOMContentLoaded', function() {
    initializeFilter({
      searchInputId: 'search-input',
      itemsSelector: '.card',
      noResultsId: 'no-results',
      listId: 'posts-list',
      tagFilterId: 'tag-filter',
      searchFields: ['title', 'author', 'description']
    });
  });
</script>

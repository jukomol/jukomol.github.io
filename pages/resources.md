---
layout: default
title: Resources
permalink: /pages/resources/
description: Teaching materials, datasets, software, and other resources
---

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Resources</h1>
  
  <!-- Search and Filter Controls -->
  <div class="mb-8 space-y-4">
    <!-- Search Box -->
    <div class="max-w-2xl">
      <input 
        type="text" 
        id="search-input" 
        placeholder="Search resources by title, type, or description..." 
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
    </div>
    
    <!-- Tag Filter -->
    <div id="tag-filter" class="flex flex-wrap gap-2">
      <!-- Tags will be populated by JavaScript -->
    </div>
  </div>
  
  <!-- Resources List -->
  <div id="resources-list">
    {% if site.resources.size > 0 %}
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {% assign sorted_resources = site.resources | sort: 'date' | reverse %}
        {% for resource in sorted_resources %}
          {% include card.html item=resource type="resource" %}
        {% endfor %}
      </div>
    {% else %}
      <div class="text-center py-12">
        <p class="text-gray-600 text-lg">No resources yet. Check back soon!</p>
      </div>
    {% endif %}
  </div>
  
  <!-- No Results Message -->
  <div id="no-results" class="hidden text-center py-12">
    <p class="text-gray-600 text-lg">No resources found matching your search.</p>
  </div>
</div>

<script src="{{ '/assets/js/filter.js' | relative_url }}"></script>
<script>
  // Initialize filtering for resources
  document.addEventListener('DOMContentLoaded', function() {
    initializeFilter({
      searchInputId: 'search-input',
      itemsSelector: '.card',
      noResultsId: 'no-results',
      listId: 'resources-list',
      tagFilterId: 'tag-filter',
      searchFields: ['title', 'resource_type', 'description']
    });
  });
</script>

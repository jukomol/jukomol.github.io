/**
 * Filter and search functionality for collections
 * Provides tag filtering and text search for publications, talks, and resources
 */

function initializeFilter(config) {
  const {
    searchInputId,
    itemsSelector,
    noResultsId,
    listId,
    tagFilterId,
    searchFields = ['title', 'description']
  } = config;

  const searchInput = document.getElementById(searchInputId);
  const items = document.querySelectorAll(itemsSelector);
  const noResults = document.getElementById(noResultsId);
  const list = document.getElementById(listId);
  const tagFilterContainer = document.getElementById(tagFilterId);

  if (!searchInput || !items.length || !noResults || !list) {
    return;
  }

  // Collect all unique tags
  const allTags = new Set();
  items.forEach(item => {
    const tags = item.dataset.tags;
    if (tags) {
      tags.split(',').forEach(tag => {
        if (tag.trim()) {
          allTags.add(tag.trim());
        }
      });
    }
  });

  // Create tag filter buttons
  let activeTag = null;
  if (allTags.size > 0 && tagFilterContainer) {
    const tagButtons = Array.from(allTags).sort().map(tag => {
      const button = document.createElement('button');
      button.className = 'tag bg-primary-100 cursor-pointer hover:bg-primary-200 transition-colors';
      button.textContent = tag;
      button.dataset.tag = tag;
      
      button.addEventListener('click', function() {
        if (activeTag === tag) {
          // Deselect
          activeTag = null;
          button.classList.remove('bg-primary-300', 'ring-2', 'ring-primary-500');
          button.classList.add('bg-primary-100');
        } else {
          // Select new tag
          activeTag = tag;
          // Remove active class from all buttons
          tagFilterContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-primary-300', 'ring-2', 'ring-primary-500');
            btn.classList.add('bg-primary-100');
          });
          // Add active class to clicked button
          button.classList.remove('bg-primary-100');
          button.classList.add('bg-primary-300', 'ring-2', 'ring-primary-500');
        }
        filterItems();
      });
      
      return button;
    });

    // Add "All" button
    const allButton = document.createElement('button');
    allButton.className = 'bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-gray-300 transition-colors';
    allButton.textContent = 'All';
    allButton.addEventListener('click', function() {
      activeTag = null;
      tagFilterContainer.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('bg-primary-300', 'ring-2', 'ring-primary-500');
        if (btn !== allButton) {
          btn.classList.add('bg-primary-100');
        }
      });
      searchInput.value = '';
      filterItems();
    });

    tagFilterContainer.appendChild(allButton);
    tagButtons.forEach(btn => tagFilterContainer.appendChild(btn));
  }

  // Filter function
  function filterItems() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    items.forEach(item => {
      let matchesSearch = true;
      let matchesTag = true;

      // Check search term
      if (searchTerm) {
        const itemText = item.textContent.toLowerCase();
        matchesSearch = itemText.includes(searchTerm);
      }

      // Check tag filter
      if (activeTag) {
        const itemTags = item.dataset.tags || '';
        matchesTag = itemTags.split(',').map(t => t.trim()).includes(activeTag);
      }

      // Show or hide item
      if (matchesSearch && matchesTag) {
        item.style.display = '';
        item.closest('.card')?.style.setProperty('display', '');
        visibleCount++;
      } else {
        item.style.display = 'none';
        item.closest('.card')?.style.setProperty('display', 'none', 'important');
      }
    });

    // Hide empty year groups
    const yearGroups = document.querySelectorAll('.year-group');
    yearGroups.forEach(group => {
      const visibleItems = group.querySelectorAll(itemsSelector + ':not([style*="display: none"])');
      if (visibleItems.length === 0) {
        group.style.display = 'none';
      } else {
        group.style.display = '';
      }
    });

    // Show/hide no results message
    if (visibleCount === 0) {
      noResults.classList.remove('hidden');
      list.classList.add('hidden');
    } else {
      noResults.classList.add('hidden');
      list.classList.remove('hidden');
    }
  }

  // Add search input listener
  searchInput.addEventListener('input', filterItems);

  // Initial filter (in case there's a search term in the URL)
  filterItems();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeFilter };
}

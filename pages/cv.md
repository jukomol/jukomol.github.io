---
layout: default
title: CV
permalink: /pages/cv/
description: Curriculum Vitae
---

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Curriculum Vitae</h1>
  
  <!-- Action Buttons -->
  <div class="mb-12 flex flex-wrap gap-3">
    {% if site.data.bio.email %}
      <a href="mailto:{{ site.data.bio.email }}" class="btn btn-primary">
        <svg class="inline-block h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Contact
      </a>
    {% endif %}
    
    {% if site.data.bio.download_cv %}
      <a href="{{ site.data.bio.download_cv | relative_url }}" target="_blank" class="btn btn-secondary">
        <svg class="inline-block h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download CV
      </a>
    {% endif %}
  </div>
  
  <!-- Education -->
  {% if site.data.bio.education %}
    <section class="mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">Education</h2>
      <div class="space-y-6">
        {% for edu in site.data.bio.education %}
          <div class="border-l-4 border-primary-500 pl-6 py-2">
            <h3 class="text-xl font-semibold text-gray-900">{{ edu.degree }}</h3>
            <p class="text-gray-700">{{ edu.institution }}</p>
            <p class="text-gray-600">{{ edu.year }}</p>
          </div>
        {% endfor %}
      </div>
    </section>
  {% endif %}
  
  <!-- Professional Experience -->
  {% if site.data.bio.experience %}
    <section class="mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">Professional Experience</h2>
      <div class="space-y-6">
        {% for exp in site.data.bio.experience %}
          <div class="border-l-4 border-primary-500 pl-6 py-2">
            <h3 class="text-xl font-semibold text-gray-900">{{ exp.position }}</h3>
            <p class="text-gray-700">{{ exp.organization }}</p>
            <p class="text-gray-600 mb-2">{{ exp.period }}</p>
            {% if exp.description %}
              <p class="text-gray-700">{{ exp.description }}</p>
            {% endif %}
          </div>
        {% endfor %}
      </div>
    </section>
  {% endif %}
  
  <!-- Research Interests -->
  {% if site.data.bio.research_interests %}
    <section class="mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">Research Interests</h2>
      <div class="flex flex-wrap gap-3">
        {% for interest in site.data.bio.research_interests %}
          <span class="bg-primary-100 text-primary-800 px-4 py-2 rounded-lg text-base font-medium">
            {{ interest }}
          </span>
        {% endfor %}
      </div>
    </section>
  {% endif %}
  
  <!-- Publications -->
  {% assign pubs_by_year = site.pubs | group_by_exp: "pub", "pub.date | date: '%Y'" | sort: "name" | reverse %}
  {% if pubs_by_year.size > 0 %}
    <section class="mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">Selected Publications</h2>
      <p class="text-gray-700 mb-4">
        See the <a href="{{ '/pages/publications/' | relative_url }}" class="text-primary-700 hover:text-primary-900 font-medium">full list of publications</a>.
      </p>
    </section>
  {% endif %}
</div>

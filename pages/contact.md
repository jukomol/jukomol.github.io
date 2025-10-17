---
layout: default
title: Contact
permalink: /pages/contact/
description: Get in touch
---

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Contact</h1>
  
  <div class="grid md:grid-cols-2 gap-12">
    <!-- Contact Information -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h2>
      
      <div class="space-y-4">
        {% if site.data.bio.email %}
          <div class="flex items-start">
            <svg class="h-6 w-6 text-primary-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p class="font-medium text-gray-900">Email</p>
              <a href="mailto:{{ site.data.bio.email }}" class="text-primary-700 hover:text-primary-900">
                {{ site.data.bio.email }}
              </a>
            </div>
          </div>
        {% endif %}
        
        {% if site.data.bio.affiliation %}
          <div class="flex items-start">
            <svg class="h-6 w-6 text-primary-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div>
              <p class="font-medium text-gray-900">Affiliation</p>
              <p class="text-gray-700">{{ site.data.bio.affiliation }}</p>
            </div>
          </div>
        {% endif %}
      </div>
      
     <!-- Social Links-->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Connect Online</h3>
        <div class="flex flex-wrap gap-3">
          {% if site.data.contact.social.github %}
            <a href="https://github.com/{{ site.data.contact.social.github }}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
              GitHub
            </a>
          {% endif %}
          
          {% if site.data.contact.social.scholar %}
            <a href="{{ site.data.contact.social.scholar }}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
              Google Scholar
            </a>
          {% endif %}
          
          {% if site.data.site.social.orcid %}
            <a href="{{ site.data.site.social.orcid }}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
              ORCID
            </a>
          {% endif %}
          
          {% if site.data.contact.social.twitter %}
            <a href="https://twitter.com/{{ site.data.contact.social.twitter }}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
              Twitter
            </a>
          {% endif %}
          
          {% if site.data.contact.social.linkedin %}
            <a href="https://linkedin.com/in/{{ site.data.contact.social.linkedin }}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
              LinkedIn
            </a>
          {% endif %}
        </div>
      </div>
    </div>
    
    <!-- Additional Information -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Office Hours</h2>
            <p class="text-gray-700 mb-4">
        Monday to Friday (9AM-5PM), By Appointment
      </p>
      <p class="text-gray-700 mb-4">
        Feel free to reach out via email to schedule a meeting or discussion.
      </p>
      
      <div class="mt-8 p-6 bg-primary-50 border border-primary-200 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Collaboration</h3>
        <p class="text-gray-700">
          I'm always interested in collaboration opportunities and discussing research ideas. 
          Don't hesitate to get in touch!
        </p>
      </div>
    </div>
  </div>
</div>

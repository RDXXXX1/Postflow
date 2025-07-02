<template>
  <div class="p-6 max-w-5xl mx-auto  rounded-xl">
    <h2 class="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
      <svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM13 9V3.5L18.5 9H13z"/>
      </svg>
      Your Saved Posts
    </h2>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-xl border border-gray-200 shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        @click="toggle(post.id)"
      >
        <div class="flex items-center p-4 gap-4">
          <svg class="w-7 h-7 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6l-6-4H4z"/>
          </svg>
          <h3 class="text-lg font-semibold text-gray-800 truncate flex-grow">{{ post.title }}</h3>
          <svg
            class="w-5 h-5 text-gray-400 transform transition-transform duration-300"
            :class="expandedId === post.id ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7"/>
          </svg>
        </div>

        <div
          v-if="expandedId === post.id"
          class="px-6 pb-4 text-gray-700 transition-all duration-300"
        >
          <p class="mb-2 whitespace-pre-wrap">{{ post.content }}</p>
          <p class="text-sm text-gray-500 mt-2">
            Saved on: {{ formatDate(post.createdAt) }}
          </p>
        </div>
      </div>
    </div>

    <p v-if="posts.length === 0" class="text-gray-500 text-center mt-8">
      No saved posts yet. They'll show up here once you save them.
    </p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "SavedPost",
  data() {
    return {
      posts: [],
      expandedId: null,
    };
  },
  methods: {
    toggle(id) {
      this.expandedId = this.expandedId === id ? null : id;
    },
    formatDate(dateStr) {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateStr).toLocaleString(undefined, options);
    },
    async fetchPosts() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await axios.get('http://localhost:5000/api/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.posts = response.data;
        console.log('User posts fetched:', response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    },
  },
  mounted() {
    this.fetchPosts();
  },
};
</script>
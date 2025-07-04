<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 font-inter">
    <div class="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 border border-blue-200">
      <div class="text-center mb-4">
        <h1 class="text-2xl font-extrabold text-gray-800 mb-2">
          Create Your New Post
        </h1>
        <p class="text-lg text-gray-600">
          Share your thoughts and ideas with the world.
        </p>
      </div>

      <div class="m-0 p-0 shadow-none rounded-lg">
        <h2 class="text-2xl font-bold text-gray-700 mb-4 border-b pb-2 border-blue-200">
          Post Details
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="postTitle" class="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="postTitle"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base transition duration-200 ease-in-out hover:border-blue-400"
              placeholder="Enter your post title"
              v-model="postTitle"
              required
            />
          </div>

          <div>
            <label for="postContent" class="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="postContent"
              rows="6"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base resize-y transition duration-200 ease-in-out hover:border-blue-400"
              placeholder="Write your post content here..."
              v-model="postContent"
              required
            ></textarea>
          </div>

          <div v-if="message" :class="['p-3 rounded-md text-sm', message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
            {{ message }}
          </div>

          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSubmitting"
          >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isSubmitting ? 'Saving...' : 'Save Post' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      postTitle: '',
      postContent: '',
      isSubmitting: false,
      message: '',
    };
  },
  methods: {
    async handleSubmit() {
      this.isSubmitting = true;
      this.message = '';

      try {
        const token = localStorage.getItem('token'); 
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.post(
          'http://localhost:5000/api/posts',
          {
            title: this.postTitle,
            content: this.postContent,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.message = response.data.message;
        this.postTitle = '';
        this.postContent = '';
      } catch (error) {
        this.message = error.response?.data?.message || 'Failed to publish the post. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    },
    async fetchPosts() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:5000/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('User posts:', response.data);
        
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
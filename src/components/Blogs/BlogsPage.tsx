import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, User, Tag, Heart, Share2, BookOpen } from 'lucide-react';
import { BlogPost } from '../../types';
import { mockBlogs } from '../../data/mockData';

const BlogsPage: React.FC = () => {
  const [blogs] = useState<BlogPost[]>(mockBlogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  const categories = [
    { value: '', label: 'All Categories', color: 'from-gray-500 to-gray-600' },
    { value: 'mental-health', label: 'Mental Health', color: 'from-green-500 to-emerald-600' },
    { value: 'pride', label: 'Pride & Identity', color: 'from-pink-500 to-purple-600' },
    { value: 'community', label: 'Community', color: 'from-blue-500 to-indigo-600' },
    { value: 'resources', label: 'Resources', color: 'from-orange-500 to-red-600' }
  ];

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || blog.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Community Blogs & Resources
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover inspiring stories, mental health resources, and educational content from our community and experts.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blogs, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg backdrop-blur-md bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.value
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-white/20 text-gray-700 hover:bg-white/30'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Featured Blog */}
        {filteredBlogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 overflow-hidden mb-8 hover:bg-white/30 transition-all duration-300"
          >
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={filteredBlogs[0].imageUrl || 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg'}
                  alt={filteredBlogs[0].title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(filteredBlogs[0].category)} text-white`}>
                    Featured
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(filteredBlogs[0].category)} text-white`}>
                    {filteredBlogs[0].category.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 hover:text-purple-600 transition-colors cursor-pointer"
                    onClick={() => setSelectedBlog(filteredBlogs[0])}>
                  {filteredBlogs[0].title}
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {filteredBlogs[0].excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{filteredBlogs[0].author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{filteredBlogs[0].readTime} min read</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedBlog(filteredBlogs[0])}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Read More
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.slice(1).map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 overflow-hidden hover:bg-white/30 transition-all duration-300 group cursor-pointer"
              onClick={() => setSelectedBlog(blog)}
            >
              <div className="relative">
                <img
                  src={blog.imageUrl || 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg'}
                  alt={blog.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(blog.category)} text-white`}>
                    {blog.category.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{blog.readTime} min</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-pink-500 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Like</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                  
                  <span className="text-xs text-gray-400">
                    {blog.publishedDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredBlogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No blogs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or explore different categories.</p>
          </motion.div>
        )}

        {/* Blog Modal */}
        {selectedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBlog(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="backdrop-blur-md bg-white/90 rounded-2xl border border-white/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedBlog.imageUrl || 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg'}
                  alt={selectedBlog.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(selectedBlog.category)} text-white`}>
                    {selectedBlog.category.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {selectedBlog.title}
                </h1>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{selectedBlog.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedBlog.readTime} min read</span>
                  </div>
                  <span>{selectedBlog.publishedDate.toLocaleDateString()}</span>
                </div>
                
                <div className="prose max-w-none text-gray-700 leading-relaxed mb-6">
                  <p className="text-lg mb-4">{selectedBlog.excerpt}</p>
                  <div className="whitespace-pre-line">{selectedBlog.content}</div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedBlog.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>Like</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
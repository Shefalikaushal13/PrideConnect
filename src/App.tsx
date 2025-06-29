import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import ChatInterface from './components/Chat/ChatInterface';
import JobsPage from './components/Jobs/JobsPage';
import CommunityPage from './components/Community/CommunityPage';
import BlogsPage from './components/Blogs/BlogsPage';
import EventsPage from './components/Events/EventsPage';
import AuthPage from './components/Auth/AuthPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="chat" element={<ChatInterface />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="blogs" element={<BlogsPage />} />
          <Route path="events" element={<EventsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
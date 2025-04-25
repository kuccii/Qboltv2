import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Flag, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ForumPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  replies: number;
  timestamp: Date;
}

const CommunityForum: React.FC = () => {
  const { currentUser } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: '1',
      author: 'John Doe',
      content: 'Has anyone noticed the recent cement price changes in Nairobi?',
      likes: 5,
      replies: 3,
      timestamp: new Date('2024-02-20T10:00:00')
    },
    {
      id: '2',
      author: 'Jane Smith',
      content: 'Looking for reliable steel suppliers in Mombasa region.',
      likes: 8,
      replies: 6,
      timestamp: new Date('2024-02-19T15:30:00')
    }
  ]);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post: ForumPost = {
      id: Date.now().toString(),
      author: currentUser?.name || 'Anonymous',
      content: newPost,
      likes: 0,
      replies: 0,
      timestamp: new Date()
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Community Discussion</h2>

      <form onSubmit={handleSubmitPost} className="mb-8">
        <div className="flex gap-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts or ask a question..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={3}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors self-end"
          >
            <Send size={20} />
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-800">{post.author}</h3>
                <span className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Flag size={16} />
              </button>
            </div>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <button className="flex items-center gap-1 hover:text-primary-600">
                <ThumbsUp size={16} />
                {post.likes}
              </button>
              <button className="flex items-center gap-1 hover:text-primary-600">
                <MessageSquare size={16} />
                {post.replies}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityForum;
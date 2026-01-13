import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // Stops page from reloading
    console.log("1. Submit clicked");

    if(email && password) {
      console.log("2. Valid inputs. Email:", email);
      setUser({ email }); 
      console.log("3. User state set. Navigating to Dashboard...");
      navigate('/');      
    } else {
      console.log("Error: Email or Password missing");
      alert("Please enter both email and password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl">
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-900">Login Test</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button type="submit" className="w-full p-3 font-bold text-white bg-purple-600 rounded hover:bg-purple-700">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
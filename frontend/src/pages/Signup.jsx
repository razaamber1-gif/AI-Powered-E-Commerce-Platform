import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: 'Male',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    // Quick client-side validation
    if (!form.name || !form.email || !form.mobile || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error('Mobile number must be a valid 10-digit Indian number');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      toast.success(`Welcome, ${form.name.split(' ')[0]}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-extrabold mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">
          Note: <strong>your name cannot be changed later</strong>, so type carefully.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Full Name" name="name" value={form.name} onChange={onChange} />
          <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} />
          <Field label="Mobile Number" name="mobile" maxLength={10} value={form.mobile} onChange={onChange} />

          <label className="block">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Gender</span>
            <select
              name="gender"
              value={form.gender}
              onChange={onChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>

          <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-md transition"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-bold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</span>
      <input
        {...props}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      />
    </label>
  );
}

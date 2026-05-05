import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';

/**
 * Profile page.
 *
 * Project requirement: name CANNOT be changed.
 * UI enforces this by rendering name as a read-only field with a 🔒 icon.
 * Backend ALSO enforces this in user.controller.js — even if someone bypasses
 * the UI and sends a name in the PUT body, the controller ignores it.
 */
export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    email: user?.email || '',
    mobile: user?.mobile || '',
  });
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    password: '',
    confirm: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onPwdChange = (e) =>
    setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error('Mobile must be a valid 10-digit number');
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.password.length < 6) {
      toast.error('New password must be 6+ chars');
      return;
    }
    if (pwdForm.password !== pwdForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPwd(true);
    try {
      await updateProfile({
        currentPassword: pwdForm.currentPassword,
        password: pwdForm.password,
      });
      toast.success('Password updated!');
      setPwdForm({ currentPassword: '', password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
      <h1 className="text-2xl font-extrabold mb-6">My Profile</h1>

      {/* Profile info card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="font-bold mb-4">Account Information</h2>

        <form onSubmit={saveProfile} className="space-y-4">
          {/* Read-only Name */}
          <label className="block">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
              Full Name <span title="Cannot be changed">🔒</span>
            </span>
            <input
              value={user?.name || ''}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500 cursor-not-allowed"
            />
            <span className="text-xs text-gray-400 mt-1 block">
              Your name cannot be changed once registered.
            </span>
          </label>

          {/* Read-only Gender */}
          <label className="block">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
              Gender <span title="Cannot be changed">🔒</span>
            </span>
            <input
              value={user?.gender || ''}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500 cursor-not-allowed"
            />
          </label>

          {/* Editable Email */}
          <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} />

          {/* Editable Mobile */}
          <Field label="Mobile Number" name="mobile" maxLength={10} value={form.mobile} onChange={onChange} />

          <button
            type="submit"
            disabled={savingProfile}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-bold px-6 py-2 rounded-md transition"
          >
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="font-bold mb-4">Change Password</h2>

        <form onSubmit={savePassword} className="space-y-4">
          <Field
            label="Current Password"
            name="currentPassword"
            type="password"
            value={pwdForm.currentPassword}
            onChange={onPwdChange}
          />
          <Field
            label="New Password"
            name="password"
            type="password"
            value={pwdForm.password}
            onChange={onPwdChange}
          />
          <Field
            label="Confirm New Password"
            name="confirm"
            type="password"
            value={pwdForm.confirm}
            onChange={onPwdChange}
          />

          <button
            type="submit"
            disabled={savingPwd}
            className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white font-bold px-6 py-2 rounded-md transition"
          >
            {savingPwd ? 'Updating...' : 'Update Password'}
          </button>
        </form>
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

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store';
import { authSuccess } from '../store/authSlice';
import API from '../utils/api';
import { ArrowLeft, Camera, Phone, Briefcase, Mail, Pencil, X } from 'lucide-react';
import { Button, message, Tag, Input, Upload, Spin } from 'antd';

const TeamMemberProfile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnProfile = !id || id === user?._id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      bio: '',
      position: '',
      phone: '',
      skills: '',
    },
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = id ? `/users/team/${id}` : '/auth/me';
      const response = await API.get(endpoint);
      setProfile(response.data.data);
      reset({
        name: response.data.data.name || '',
        bio: response.data.data.bio || '',
        position: response.data.data.position || '',
        phone: response.data.data.phone || '',
        skills: response.data.data.skills ? response.data.data.skills.join(', ') : '',
      });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const onSubmit = async (data: any) => {
    if (!isOwnProfile) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('bio', data.bio);
      formData.append('position', data.position);
      formData.append('phone', data.phone);
      formData.append('skills', data.skills || '');
      if (file) {
        formData.append('profilePic', file);
      }
      const response = await API.put('/auth/me', formData);
      setProfile(response.data.data);
      reset({
        name: response.data.data.name || '',
        bio: response.data.data.bio || '',
        position: response.data.data.position || '',
        phone: response.data.data.phone || '',
        skills: response.data.data.skills ? response.data.data.skills.join(', ') : '',
      });
      dispatch(authSuccess({ user: response.data.data, token: localStorage.getItem('token') || '' }));
      message.success('Profile updated successfully.');
      setFile(null);
      setIsEditing(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Profile update failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    reset({
      name: profile?.name || '',
      bio: profile?.bio || '',
      position: profile?.position || '',
      phone: profile?.phone || '',
      skills: profile?.skills ? profile.skills.join(', ') : '',
    });
    setFile(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafc] dark:bg-slate-950 transition-colors duration-300">
        <Spin size="large" />
      </div>
    );
  }

  const skillsList: string[] = profile?.skills || [];

  return (
    <div className="min-h-screen bg-[#f4f2ee] dark:bg-slate-950 pb-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 text-sm font-medium hover:text-slate-900 mb-4"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Profile card */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Cover banner */}
          <div className="h-32 sm:h-20 " />

          {/* Avatar + header */}
          <div className="px-5 sm:px-8 pb-5 relative">
            <div className="relative -mt-14 sm:-mt-16 w-28 h-28 sm:w-32 sm:h-32">
              <div className="w-full h-full rounded-full ring-4 ring-white bg-slate-100 overflow-hidden flex items-center justify-center text-3xl font-bold text-sky-700">
                {profile?.profilePic ? (
                  <img
                    src={
                      profile.profilePic.startsWith('/uploads/')
                        ? `https://jira-m1jo.onrender.com${profile.profilePic}`
                        : profile.profilePic
                    }
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.name?.[0]?.toUpperCase() || 'T'
                )}
              </div>
              {isOwnProfile && (
                <Upload
                  beforeUpload={(f) => {
                    setFile(f as File);
                    return false;
                  }}
                  onRemove={() => setFile(null)}
                  accept="image/*"
                  maxCount={1}
                  showUploadList={false}
                >
                  <button
                    type="button"
                    title="Change photo"
                    className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50"
                  >
                    <Camera size={16} />
                  </button>
                </Upload>
              )}
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                <div className="text-base text-slate-700 mt-0.5">
                  {profile.position || (profile.role ? profile.role.replace('_', ' ') : 'Team Member')}
                </div>
                <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  <Mail size={14} />
                  {profile.email}
                </div>
              </div>

              {isOwnProfile && !isEditing && (
                <Button
                  icon={<Pencil size={14} />}
                  onClick={() => setIsEditing(true)}
                  shape="round"
                  className="!flex !items-center !gap-1.5 !border-sky-700 !text-sky-700 !font-semibold shrink-0"
                >
                  Edit profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Edit form (LinkedIn-style edit panel) */}
        {isOwnProfile && isEditing && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-slate-200 mt-3 p-5 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Edit intro</h2>
              <button type="button" onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full name</label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => <Input {...field} size="large" />}
              />
              {errors.name && <div className="text-xs text-rose-500 mt-1">{errors.name.message}</div>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Position</label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => <Input {...field} size="large" placeholder="E.g. Senior QA Engineer" />}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => <Input {...field} size="large" />}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio</label>
              <Controller
                name="bio"
                control={control}
                render={({ field }) => <Input.TextArea rows={4} {...field} placeholder="Tell people about yourself" />}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Skills</label>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => <Input {...field} size="large" placeholder="E.g. React, Node.js, QA" />}
              />
              <div className="text-xs text-slate-400 mt-1">Separate skills with commas.</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button onClick={handleCancelEdit} shape="round">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading || isSubmitting}
                shape="round"
                className="!bg-sky-700"
              >
                Save
              </Button>
            </div>
          </form>
        )}

        {/* About */}
        <div className="bg-white rounded-lg border border-slate-200 mt-3 p-5 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3">About</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {profile.bio || 'No bio added yet.'}
          </p>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg border border-slate-200 mt-3 p-5 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Skills</h2>
          {skillsList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill: string) => (
                <Tag key={skill} color="blue" className="!text-sm !py-1 !px-3 !rounded-full">
                  {skill}
                </Tag>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400">No skills listed.</div>
          )}
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-lg border border-slate-200 mt-3 p-5 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Contact info</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-slate-400" />
              <span className="text-slate-700">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-slate-400" />
              <span className="text-slate-700">{profile.phone || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Briefcase size={16} className="text-slate-400" />
              <span className="text-slate-700">{profile.position || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberProfile;
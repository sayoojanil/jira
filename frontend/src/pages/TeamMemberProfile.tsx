import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../store';
import { authSuccess } from '../store/authSlice';
import API, { getFileUrl } from '../utils/api';
import { ArrowLeft, Camera, Phone, Briefcase, Mail, Pencil, X, MoveLeft, MoveRight, MoveUp, MoveDown, ZoomIn, ZoomOut, Badge, CheckCircle2, User } from 'lucide-react';
import { Button, message, Tag, Input, Upload, Spin, Modal } from 'antd';

const TeamMemberProfile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarSource, setAvatarSource] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [cropScale, setCropScale] = useState(1);

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

  const resetAvatarCrop = () => {
    setAvatarModalOpen(false);
    setAvatarSource(null);
    setAvatarFile(null);
    setCropOffsetX(0);
    setCropOffsetY(0);
    setCropScale(1);
  };

  const openAvatarPreview = () => {
    if (profile?.profilePic) {
      setAvatarPreviewUrl(getFileUrl(profile.profilePic) || null);
      setAvatarPreviewOpen(true);
    }
  };

  const handleAvatarSelection = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      message.error('Please select an image file.');
      return false;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarSource(reader.result as string);
      setAvatarFile(selectedFile);
      setCropOffsetX(0);
      setCropOffsetY(0);
      setCropScale(1);
      setAvatarModalOpen(true);
    };
    reader.readAsDataURL(selectedFile);
    return false;
  };

  const handleMoveCrop = (dx: number, dy: number) => {
    setCropOffsetX((prev) => prev + dx);
    setCropOffsetY((prev) => prev + dy);
  };

  const handleZoomChange = (delta: number) => {
    setCropScale((prev) => Math.min(2.5, Math.max(1, prev + delta)));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !avatarSource) return;

    try {
      setUploading(true);
      const img = new Image();
      img.src = avatarSource;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image could not be loaded.'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Unable to create image preview.');
      }

      const canvasSize = 320;
      const cropSize = 320;
      
      // Calculate the scale to fit the image in the crop area
      const fitScale = Math.max(cropSize / img.naturalWidth, cropSize / img.naturalHeight);
      const effectiveScale = fitScale * cropScale;
      
      // Calculate the size of the source image to crop
      const sourceWidth = cropSize / effectiveScale;
      const sourceHeight = cropSize / effectiveScale;
      
      // Calculate the center of the source image
      const sourceCenterX = img.naturalWidth / 2;
      const sourceCenterY = img.naturalHeight / 2;
      
      // Apply offset to the center (in source image coordinates)
      const offsetX = cropOffsetX / effectiveScale;
      const offsetY = cropOffsetY / effectiveScale;
      
      // Calculate the crop rectangle (centered on source center + offset)
      let sourceX = sourceCenterX - sourceWidth / 2 + offsetX;
      let sourceY = sourceCenterY - sourceHeight / 2 + offsetY;
      
      // Clamp to image bounds
      sourceX = Math.max(0, Math.min(sourceX, img.naturalWidth - sourceWidth));
      sourceY = Math.max(0, Math.min(sourceY, img.naturalHeight - sourceHeight));

      // Fill with white background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvasSize, canvasSize);

      // Create circular clipping path
      context.save();
      context.beginPath();
      context.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
      context.closePath();
      context.clip();
      
      // Draw the image centered in the circle
      context.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvasSize, canvasSize);
      context.restore();

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
      if (!blob) {
        throw new Error('Unable to prepare the cropped image.');
      }

      const formData = new FormData();
      formData.append('profilePic', blob, avatarFile.name || 'profile.jpg');

      const response = await API.put('/auth/me', formData);
      setProfile((prev: any) => (prev ? { ...prev, profilePic: response.data.data.profilePic } : response.data.data));
      dispatch(authSuccess({ user: response.data.data, token: localStorage.getItem('token') || '' }));
      message.success('Profile photo updated successfully.');
      resetAvatarCrop();
    } catch (err: any) {
      message.error(err.response?.data?.message || err.message || 'Profile photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

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
    setIsEditing(false);
  };

if (loading) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen">
      <div className="flex flex-row gap-2 ">
        <div className="w-2 h-2 rounded-full bg-[#0055FF] animate-bounce"></div>
        <div className="w-2 h-2 rounded-full bg-[#0055FF] animate-bounce [animation-delay:-.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-[#0055FF] animate-bounce [animation-delay:-.5s]"></div>
      </div>
    </div>
  );
}


  const skillsList: string[] = profile?.skills || [];

  return (
    <div className="min-h-screen  dark:bg-slate-950 pb-12 transition-colors duration-300">
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
          <div className="h-24 item-center sm:h-20" />

          {/* Avatar + header */}
          <div className="px-5 sm:px-8 pb-5 relative">
<div className="relative -mt-14 sm:-mt-16 w-28 h-28 sm:w-32 sm:h-32 mx-auto sm:mx-0">              <button
                type="button"
                onClick={profile?.profilePic ? openAvatarPreview : undefined}
                className={`w-full h-full rounded-full ring-4 ring-white bg-slate-100 overflow-hidden flex items-center justify-center text-3xl font-bold text-sky-700 ${profile?.profilePic ? 'cursor-zoom-in' : 'cursor-default'}`}
              >
                {profile?.profilePic ? (
                  <img
                    src={getFileUrl(profile.profilePic)}
                    alt={profile.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <img 
                    src={profile?.gender === 'Female' 
                      ? 'https://img.magnific.com/free-vector/flat-style-woman-avatar_90220-2944.jpg?semt=ais_hybrid&w=740&q=80' 
                      : 'https://st.depositphotos.com/2101611/3925/v/450/depositphotos_39258143-stock-illustration-businessman-avatar-profile-picture.jpg'}
                    className="h-full w-full object-cover object-center"
                    alt="Default avatar"
                  />
                )}
              </button>
              {isOwnProfile && (
                <Upload
                  beforeUpload={(file) => handleAvatarSelection(file as File)}
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
<div className="flex items-center justify-center  rounded-full sm:justify-start gap-1 mt-5">
  <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
  <span className="text-sm font-medium text-green-500">Verified</span>
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
                  className="!flex !items-center !gap-1.5 !text-white bg-[#0055FF] !font-semibold shrink-0 text-xs"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Avatar Preview Modal */}
        <Modal 
          open={avatarPreviewOpen} 
          onCancel={() => setAvatarPreviewOpen(false)} 
          footer={null} 
          centered
          bodyStyle={{ padding: '20px' }}
        >
          <div className="flex items-center justify-center">
            {avatarPreviewUrl && (
              <img 
                src={avatarPreviewUrl} 
                alt={profile?.name || 'Profile photo'} 
                className="max-h-[60vh] max-w-[60vh] rounded-full object-contain shadow-lg"
              />
            )}
          </div>
        </Modal>

        {/* Crop Modal */}
        <Modal 
          open={avatarModalOpen} 
          onCancel={resetAvatarCrop} 
          footer={null} 
          title="Crop profile photo" 
          centered
          width={400}
        >
          <div className="space-y-4">
            <div className="mx-auto flex h-72 w-72 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 relative">
              {avatarSource && (
                <>
                  <img
                    src={avatarSource}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    style={{ 
                      transform: `scale(${cropScale}) translate(${cropOffsetX / cropScale}px, ${cropOffsetY / cropScale}px)`,
                      transformOrigin: 'center center'
                    }}
                  />
                  {/* Circle crop indicator overlay */}
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-sky-500 border-opacity-70 pointer-events-none"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      top: 0,
                      left: 0,
                    }}
                  />
                  {/* Semi-transparent overlay outside the circle */}
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.4) 50.5%)',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button icon={<ZoomOut size={14} />} onClick={() => handleZoomChange(-0.1)} />
                <span className="text-sm text-slate-600 min-w-[40px] text-center">{cropScale.toFixed(1)}x</span>
                <Button icon={<ZoomIn size={14} />} onClick={() => handleZoomChange(0.1)} />
              </div>
              <div className="flex items-center gap-2">
                <Button icon={<MoveLeft size={14} />} onClick={() => handleMoveCrop(-10, 0)} />
                <Button icon={<MoveRight size={14} />} onClick={() => handleMoveCrop(10, 0)} />
                <Button icon={<MoveUp size={14} />} onClick={() => handleMoveCrop(0, -10)} />
                <Button icon={<MoveDown size={14} />} onClick={() => handleMoveCrop(0, 10)} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button onClick={resetAvatarCrop}>Cancel</Button>
              <Button type="primary" loading={uploading} onClick={handleAvatarUpload} className="!bg-sky-700">
                Upload photo
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit form */}
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender (Cannot be changed)</label>
              <Input value={profile?.gender || 'Not specified'} disabled size="large" />
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
                className="!bg-[#0055FF]"
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
            <div className="flex items-center gap-3 text-sm">
              <User size={16} className="text-slate-400" />
              <span className="text-slate-700">{profile.gender || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberProfile;
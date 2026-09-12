import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase, FALLBACK_PROFILE } from '../../lib/supabase'
import { AlertCircle, CheckCircle, Upload } from 'lucide-react'

export default function ProfileTab() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [profileId, setProfileId] = useState(null)
  const [message, setMessage] = useState(null)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [cvMessage, setCVMessage] = useState(null)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('profile').select('*').single()
        if (data) {
          setProfileId(data.id)
          reset({
            name: data.name || '',
            current_position: data.current_position || '',
            bio: data.bio || '',
            professional_summary: data.professional_summary || '',
            affiliation: data.affiliation || '',
            email: data.email || '',
            address: data.address || '',
            research_interests: data.research_interests?.join(', ') || '',
            github_url: data.social_links?.github_url || '',
            linkedin_url: data.social_links?.linkedin_url || '',
            twitter_url: data.social_links?.twitter_url || '',
            scholar_url: data.social_links?.scholar_url || '',
            orcid_url: data.social_links?.orcid_url || ''
          })
        } else if (error?.code === 'PGRST116') {
          reset({
            name: FALLBACK_PROFILE.name,
            current_position: '',
            bio: FALLBACK_PROFILE.bio,
            professional_summary: '',
            affiliation: FALLBACK_PROFILE.affiliation,
            email: '',
            address: 'Omaha, Nebraska',
            research_interests: FALLBACK_PROFILE.research_interests.join(', '),
            github_url: '',
            linkedin_url: '',
            twitter_url: '',
            scholar_url: '',
            orcid_url: ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setProfileMessage({ type: 'error', text: 'Only JPG and PNG files are allowed' })
      return
    }

    setUploadingProfile(true)
    setProfileMessage(null)

    try {
      if (!supabase) {
        setProfileMessage({ type: 'error', text: 'Supabase not configured' })
        return
      }

      const ext = file.type === 'image/png' ? '.png' : '.jpg'
      const fileName = `profile${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(fileName)

      setProfileMessage({ type: 'success', text: 'Profile picture uploaded successfully!' })
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Failed to upload profile picture: ' + error.message })
    } finally {
      setUploadingProfile(false)
      e.target.value = ''
    }
  }

  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setCVMessage({ type: 'error', text: 'Only PDF files are allowed' })
      return
    }

    setUploadingCV(true)
    setCVMessage(null)

    try {
      if (!supabase) {
        setCVMessage({ type: 'error', text: 'Supabase not configured' })
        return
      }

      const fileName = 'cv-latest.pdf'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(fileName)

      setCVMessage({ type: 'success', text: 'CV uploaded successfully! File is available at: ' + publicUrl })
    } catch (error) {
      setCVMessage({ type: 'error', text: 'Failed to upload CV: ' + error.message })
    } finally {
      setUploadingCV(false)
      e.target.value = ''
    }
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setMessage(null)

    try {
      if (!supabase) {
        setMessage({ type: 'error', text: 'Supabase not configured' })
        return
      }

      const payload = {
        name: data.name,
        current_position: data.current_position || null,
        bio: data.bio,
        professional_summary: data.professional_summary || null,
        affiliation: data.affiliation,
        email: data.email || null,
        address: data.address || null,
        research_interests: data.research_interests
          .split(',')
          .map(i => i.trim())
          .filter(i => i),
        social_links: {
          github_url: data.github_url || null,
          linkedin_url: data.linkedin_url || null,
          twitter_url: data.twitter_url || null,
          scholar_url: data.scholar_url || null,
          orcid_url: data.orcid_url || null
        }
      }

      if (profileId) {
        const { error } = await supabase
          .from('profile')
          .update(payload)
          .eq('id', profileId)
        if (error) throw error
      } else {
        const { data: inserted, error } = await supabase
          .from('profile')
          .insert([payload])
          .select()
        if (error) throw error
        if (inserted?.[0]) setProfileId(inserted[0].id)
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Profile</h2>

      {profileMessage && (
        <div className={`flex gap-3 mb-6 p-4 rounded-lg ${
          profileMessage.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {profileMessage.type === 'success' ? (
            <CheckCircle className="text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0" />
          )}
          <p className={profileMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {profileMessage.text}
          </p>
        </div>
      )}

      {message && (
        <div className={`flex gap-3 mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleProfilePictureUpload}
                disabled={uploadingProfile}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-sm text-gray-600 mt-2">Upload JPG or PNG image (recommended: square 300x300px or larger)</p>
            </div>
            {uploadingProfile && (
              <div className="flex items-center gap-2">
                <div className="animate-spin">
                  <Upload size={20} className="text-cyan-600" />
                </div>
                <span className="text-cyan-600 font-medium">Uploading...</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Current Position</label>
          <input
            {...register('current_position')}
            placeholder="e.g., PhD Student, Research Assistant, Postdoctoral Fellow"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="komolma37@gmail.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
          <input
            {...register('address')}
            placeholder="Omaha, Nebraska"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
          <textarea
            {...register('bio')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Professional Summary (CV Page)</label>
          <textarea
            {...register('professional_summary')}
            rows={4}
            placeholder="This will appear on the CV page as the professional summary section. You can use markdown formatting for styling."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-600 mt-1">Markdown supported: **bold**, *italic*, [links](url), # headings, - bullets</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Affiliation</label>
          <input
            {...register('affiliation')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Research Interests (comma-separated)
          </label>
          <textarea
            {...register('research_interests')}
            rows={3}
            placeholder="e.g., AI, Machine Learning, Computer Vision"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">GitHub URL</label>
              <input
                {...register('github_url')}
                type="url"
                placeholder="https://github.com/username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn URL</label>
              <input
                {...register('linkedin_url')}
                type="url"
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">X (Twitter) URL</label>
              <input
                {...register('twitter_url')}
                type="url"
                placeholder="https://x.com/username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Google Scholar URL</label>
              <input
                {...register('scholar_url')}
                type="url"
                placeholder="https://scholar.google.com/citations?user=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ORCID URL</label>
              <input
                {...register('orcid_url')}
                type="url"
                placeholder="https://orcid.org/0000-0000-0000-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 transition font-semibold"
        >
          {submitting ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-6">CV File Upload</h2>

        {cvMessage && (
          <div className={`flex gap-3 mb-6 p-4 rounded-lg ${
            cvMessage.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {cvMessage.type === 'success' ? (
              <CheckCircle className="text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="text-red-600 flex-shrink-0" />
            )}
            <p className={cvMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {cvMessage.text}
            </p>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload PDF CV
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleCVUpload}
                disabled={uploadingCV}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-sm text-gray-600 mt-2">Upload a PDF file to replace your CV</p>
            </div>
            {uploadingCV && (
              <div className="flex items-center gap-2">
                <div className="animate-spin">
                  <Upload size={20} className="text-cyan-600" />
                </div>
                <span className="text-cyan-600 font-medium">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "../../lib/supabase"
import { AlertCircle, CheckCircle, Upload, Plus, Trash2, Edit2 } from "lucide-react"

export default function CVTab() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const [categories, setCategories] = useState([])
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (supabase) {
        const { data: timelineData, error: timelineError } = await supabase
          .from("cv_timeline")
          .select("*")
          .order("start_date", { ascending: false })

        if (timelineError) throw timelineError

        const uniqueCategories = [...new Set(timelineData?.map(item => item.category) || [])]
        setCategories(uniqueCategories)
        setTimeline(timelineData || [])

        if (uniqueCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(uniqueCategories[0])
        }
      }
    } catch (error) {
      console.error("Error fetching CV data:", error)
      setMessage({ type: "error", text: "Failed to load CV data" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setMessage({ type: "error", text: "Category name is required" })
      return
    }

    if (categories.includes(newCategoryName.trim())) {
      setMessage({ type: "error", text: "Category already exists" })
      return
    }

    setCreatingCategory(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from("cv_timeline")
        .insert([{
          category: newCategoryName.trim(),
          title: "New Entry",
          organization: "",
          description: "",
          start_date: new Date().toISOString()
        }])

      if (error) throw error

      setCategories([...categories, newCategoryName.trim()])
      setSelectedCategory(newCategoryName.trim())
      setNewCategoryName("")
      setMessage({ type: "success", text: "Category created successfully" })
      await fetchData()
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create category: " + error.message })
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleLogoUpload = async (e, entryId) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Only JPG and PNG files are allowed" })
      return
    }

    setUploadingLogo(true)

    try {
      if (!supabase) {
        setMessage({ type: "error", text: "Supabase not configured" })
        return
      }

      const ext = file.type === "image/png" ? ".png" : ".jpg"
      const fileName = `logo-${entryId}${ext}`

      const { error: uploadError } = await supabase.storage
        .from("portfolio-assets")
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("portfolio-assets")
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from("cv_timeline")
        .update({ logo_url: publicUrl })
        .eq("id", entryId)

      if (updateError) throw updateError

      setMessage({ type: "success", text: "Logo uploaded successfully" })
      await fetchData()
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload logo: " + error.message })
    } finally {
      setUploadingLogo(false)
      e.target.value = ""
    }
  }

  const handleDeleteEntry = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const { error } = await supabase
        .from("cv_timeline")
        .delete()
        .eq("id", id)

      if (error) throw error

      setMessage({ type: "success", text: "Entry deleted successfully" })
      await fetchData()
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete entry: " + error.message })
    }
  }

  const handleSaveEntry = async (data) => {
    setSubmitting(true)
    setMessage(null)

    try {
      if (!supabase) {
        setMessage({ type: "error", text: "Supabase not configured" })
        return
      }

      if (editingEntry) {
        const { error } = await supabase
          .from("cv_timeline")
          .update({
            title: data.title,
            organization: data.organization,
            description: data.description,
            start_date: data.start_date,
            end_date: data.end_date || null,
            category: data.category
          })
          .eq("id", editingEntry.id)

        if (error) throw error
      } else {
        const { data: inserted, error } = await supabase
          .from("cv_timeline")
          .insert([{
            category: selectedCategory,
            title: data.title,
            organization: data.organization,
            description: data.description,
            start_date: data.start_date,
            end_date: data.end_date || null
          }])
          .select()

        if (error) throw error

        // Auto-switch to edit mode so user can upload logo
        if (inserted?.[0]) {
          setMessage({ type: "success", text: "Entry created! Now you can upload a logo." })
          setEditingEntry(inserted[0])
          reset({
            title: inserted[0].title,
            organization: inserted[0].organization,
            description: inserted[0].description,
            start_date: inserted[0].start_date?.split("T")[0] || "",
            end_date: inserted[0].end_date?.split("T")[0] || "",
            category: inserted[0].category
          })
          await fetchData()
          return
        }
      }

      setMessage({ type: "success", text: "Entry saved successfully" })
      setEditingEntry(null)
      reset()
      await fetchData()
    } catch (error) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const categoryEntries = timeline.filter(item => item.category === selectedCategory)

  if (loading) return <p className="text-gray-500">Loading CV data...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Curriculum Vitae</h2>

      {message && (
        <div className={`flex gap-3 mb-6 p-4 rounded-lg ${
          message.type === "success"
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}>
          {message.type === "success" ? (
            <CheckCircle className="text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="text-red-600 flex-shrink-0" />
          )}
          <p className={message.type === "success" ? "text-green-700" : "text-red-700"}>
            {message.text}
          </p>
        </div>
      )}

      <div className="mb-8 bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Categories</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map(cat => (
            <div key={cat} className="flex items-center gap-1">
              <button
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? "bg-cyan-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-cyan-500"
                }`}
              >
                {cat}
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Delete category "${cat}" and all its entries?`)) {
                    try {
                      await supabase.from("cv_timeline").delete().eq("category", cat)
                      setMessage({ type: "success", text: `Category "${cat}" deleted` })
                      fetchData()
                    } catch (error) {
                      setMessage({ type: "error", text: "Failed to delete category" })
                    }
                  }
                }}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                title="Delete category"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New category name (e.g., Experience, Projects, Education)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            disabled={creatingCategory}
            className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 transition font-semibold flex items-center gap-2"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      {selectedCategory && (
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">{selectedCategory} Entries</h3>
            <div className="space-y-3">
              {categoryEntries.map(entry => (
                <div key={entry.id} className="bg-white border border-gray-300 rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1 flex gap-4">
                    {entry.logo_url && (
                      <img src={entry.logo_url} alt={entry.organization} className="w-16 h-16 object-cover rounded flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                      <p className="text-sm text-gray-600">{entry.organization}</p>
                      {entry.description && <p className="text-sm text-gray-700 mt-1">{entry.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingEntry(entry)
                        reset({
                          title: entry.title,
                          organization: entry.organization,
                          description: entry.description,
                          start_date: entry.start_date?.split("T")[0] || "",
                          end_date: entry.end_date?.split("T")[0] || "",
                          category: entry.category
                        })
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setEditingEntry(null)
                reset({ title: "", organization: "", description: "", start_date: "", end_date: "", category: selectedCategory })
              }}
              className="mt-4 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition font-semibold flex items-center gap-2"
            >
              <Plus size={18} /> Add Entry
            </button>
          </div>

          {(editingEntry || !editingEntry) && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-2xl">
              <h3 className="text-xl font-bold mb-4">{editingEntry ? "Edit Entry" : "New Entry"}</h3>

              <form onSubmit={handleSubmit(handleSaveEntry)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Organization</label>
                  <input
                    {...register("organization")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                    <input
                      {...register("start_date", { required: "Start date is required" })}
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    {errors.start_date && <p className="text-red-600 text-sm mt-1">{errors.start_date.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">End Date (optional)</label>
                    <input
                      {...register("end_date")}
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Markdown supported)</label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Describe your role/project. Use **bold**, *italic*, or - for bullets"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-600 mt-1">Tip: Use **text** for bold, *text* for italic, - for bullet points, # for headings</p>
                </div>

                {editingEntry && editingEntry.id && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Logo</label>
                    {editingEntry.logo_url && (
                      <div className="mb-3 flex items-center gap-3">
                        <img src={editingEntry.logo_url} alt="Logo" className="w-12 h-12 object-cover rounded" />
                        <span className="text-sm text-gray-600">Logo set</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Upload File</label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          onChange={(e) => handleLogoUpload(e, editingEntry.id)}
                          disabled={uploadingLogo}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Or Image URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com/logo.png"
                          onBlur={async (e) => {
                            const url = e.target.value.trim()
                            if (url && editingEntry.id) {
                              try {
                                await supabase.from("cv_timeline").update({ logo_url: url }).eq("id", editingEntry.id)
                                setMessage({ type: "success", text: "Logo URL saved" })
                                setEditingEntry({ ...editingEntry, logo_url: url })
                              } catch (error) {
                                setMessage({ type: "error", text: "Failed to save logo URL" })
                              }
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Upload JPG/PNG or provide image URL (recommended: square 100x100px)</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 transition font-semibold"
                  >
                    {submitting ? "Saving..." : "Save Entry"}
                  </button>
                  {editingEntry && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEntry(null)
                        reset()
                      }}
                      className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
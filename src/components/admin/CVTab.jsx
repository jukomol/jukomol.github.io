import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "../../lib/supabase"
import { AlertCircle, CheckCircle, Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, GripVertical } from "lucide-react"

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
  const [renamingCategory, setRenamingCategory] = useState(null)
  const [renameCategoryValue, setRenameCategoryValue] = useState("")
  const [isCreatingNewEntry, setIsCreatingNewEntry] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [draggedCategory, setDraggedCategory] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (supabase) {
        const { data: timelineData, error: timelineError } = await supabase
          .from("cv_timeline")
          .select("*")
          .order("category_order", { ascending: true })
          .order("sort_order", { ascending: true })
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
          start_date: new Date().toISOString(),
          category_order: categories.length
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

  const handleRenameCategory = async (oldName, newName) => {
    const trimmedNewName = newName.trim()

    if (!trimmedNewName) {
      setMessage({ type: "error", text: "Category name is required" })
      return
    }

    if (trimmedNewName === oldName) {
      setRenamingCategory(null)
      return
    }

    if (categories.includes(trimmedNewName)) {
      setMessage({ type: "error", text: "Category already exists" })
      return
    }

    try {
      const { error } = await supabase
        .from("cv_timeline")
        .update({ category: trimmedNewName })
        .eq("category", oldName)

      if (error) throw error

      setCategories(categories.map(c => c === oldName ? trimmedNewName : c))
      if (selectedCategory === oldName) {
        setSelectedCategory(trimmedNewName)
      }
      setRenamingCategory(null)
      setRenameCategoryValue("")
      setMessage({ type: "success", text: `Category renamed to "${trimmedNewName}"` })
      await fetchData()
    } catch (error) {
      setMessage({ type: "error", text: "Failed to rename category: " + error.message })
    }
  }

  const handleAddNewEntry = () => {
    setIsCreatingNewEntry(true)
    setEditingEntry(null)
    reset({
      title: "",
      organization: "",
      description: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      category: selectedCategory
    })
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
        setMessage({ type: "success", text: "Entry saved successfully" })
        setEditingEntry(null)
        setIsCreatingNewEntry(false)
      } else if (isCreatingNewEntry) {
        const { data: inserted, error } = await supabase
          .from("cv_timeline")
          .insert([{
            category: selectedCategory,
            title: data.title,
            organization: data.organization,
            description: data.description,
            start_date: data.start_date,
            end_date: data.end_date || null,
            category_order: timeline.find(e => e.category === selectedCategory)?.category_order ?? 0,
            sort_order: categoryEntries.length
          }])
          .select()

        if (error) throw error

        if (inserted?.[0]) {
          setMessage({ type: "success", text: "Entry created! Now you can upload a logo." })
          setEditingEntry(inserted[0])
          setIsCreatingNewEntry(false)
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

      reset()
      await fetchData()
    } catch (error) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  const categoryEntries = timeline.filter(item => item.category === selectedCategory)

  const moveInArray = (arr, from, to) => {
    const next = [...arr]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
  }

  const persistOrder = async (updates, label) => {
    const results = await Promise.all(updates)
    const failed = results.find(r => r.error)
    if (failed) setMessage({ type: "error", text: `Failed to update ${label} order: ${failed.error.message}` })
    await fetchData()
  }

  const reorderCategories = async (from, to) => {
    if (from === to || to < 0 || to >= categories.length) return
    const next = moveInArray(categories, from, to)
    setCategories(next)
    await persistOrder(
      next.map((cat, i) => supabase.from("cv_timeline").update({ category_order: i }).eq("category", cat)),
      "category"
    )
  }

  const reorderEntries = async (from, to) => {
    if (from === to || to < 0 || to >= categoryEntries.length) return
    const next = moveInArray(categoryEntries, from, to)
    const ids = new Set(next.map(e => e.id))
    setTimeline([...timeline.filter(e => !ids.has(e.id)), ...next])
    await persistOrder(
      next.map((entry, i) => supabase.from("cv_timeline").update({ sort_order: i }).eq("id", entry.id)),
      "entry"
    )
  }

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
        <h3 className="text-xl font-bold mb-1">Categories</h3>
        {categories.length > 1 && (
          <p className="text-xs text-gray-500 mb-3">Drag categories (or use the arrows) to set the order shown on your CV.</p>
        )}
        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map((cat, catIndex) => (
            <div
              key={cat}
              draggable={renamingCategory !== cat}
              onDragStart={() => setDraggedCategory(catIndex)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (draggedCategory !== null) reorderCategories(draggedCategory, catIndex)
                setDraggedCategory(null)
              }}
              onDragEnd={() => setDraggedCategory(null)}
              className={`rounded-lg ${draggedCategory === catIndex ? "opacity-50" : ""} ${categories.length > 1 ? "cursor-move" : ""}`}
            >
              {renamingCategory === cat ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={renameCategoryValue}
                    onChange={(e) => setRenameCategoryValue(e.target.value)}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleRenameCategory(cat, renameCategoryValue)
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleRenameCategory(cat, renameCategoryValue)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                    title="Confirm"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setRenamingCategory(null)
                      setRenameCategoryValue("")
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded transition"
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {categories.length > 1 && (
                    <div className="flex flex-col">
                      <button
                        onClick={() => reorderCategories(catIndex, catIndex - 1)}
                        disabled={catIndex === 0}
                        className="p-0.5 text-gray-500 hover:text-cyan-600 disabled:opacity-30"
                        title="Move earlier"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        onClick={() => reorderCategories(catIndex, catIndex + 1)}
                        disabled={catIndex === categories.length - 1}
                        className="p-0.5 text-gray-500 hover:text-cyan-600 disabled:opacity-30"
                        title="Move later"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
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
                    onClick={() => {
                      setRenamingCategory(cat)
                      setRenameCategoryValue(cat)
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Rename category"
                  >
                    <Edit2 size={16} />
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
              )}
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
              {categoryEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  draggable
                  onDragStart={() => setDraggedItem({ entry, index })}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedItem) reorderEntries(draggedItem.index, index)
                    setDraggedItem(null)
                  }}
                  onDragEnd={() => setDraggedItem(null)}
                  className={`bg-white border-2 rounded-lg p-3 sm:p-4 flex justify-between items-start gap-2 cursor-move transition ${
                    draggedItem?.entry.id === entry.id
                      ? "border-cyan-600 bg-cyan-50 opacity-50"
                      : "border-gray-300 hover:border-cyan-400"
                  }`}
                >
                  <div className="flex flex-col items-center text-gray-400 -ml-1">
                    <button
                      onClick={() => reorderEntries(index, index - 1)}
                      disabled={index === 0}
                      className="p-0.5 hover:text-cyan-600 disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <GripVertical size={16} className="hidden sm:block" />
                    <button
                      onClick={() => reorderEntries(index, index + 1)}
                      disabled={index === categoryEntries.length - 1}
                      className="p-0.5 hover:text-cyan-600 disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0 flex gap-4">
                    {entry.logo_url && (
                      <img src={entry.logo_url} alt={entry.organization} className="w-20 h-20 object-cover rounded flex-shrink-0" />
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
                        setIsCreatingNewEntry(false)
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
              onClick={handleAddNewEntry}
              className="mt-4 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition font-semibold flex items-center gap-2"
            >
              <Plus size={18} /> Add Entry
            </button>
          </div>

          {(editingEntry || isCreatingNewEntry) && (
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

                {editingEntry?.id && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Logo</label>
                    {editingEntry.logo_url && (
                      <div className="mb-3 flex items-center gap-3">
                        <img src={editingEntry.logo_url} alt="Logo" className="w-20 h-20 object-cover rounded" />
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
                  {(editingEntry || isCreatingNewEntry) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEntry(null)
                        setIsCreatingNewEntry(false)
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
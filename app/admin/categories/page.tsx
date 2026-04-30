"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Edit2, Trash2, Upload, X } from "lucide-react"
import type { Category } from "@/lib/categories"

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("created_at", { ascending: false })
    setCategories(data || [])
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const imageFormData = new FormData()
      imageFormData.append("file", file)
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: imageFormData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }
      
      setFormData({ ...formData, imageUrl: data.url })
    } catch (error) {
      console.error("Upload failed:", error)
      alert(error instanceof Error ? error.message : "Failed to upload image. Please try again.")
      setImagePreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      await supabase
        .from("categories")
        .update({
          name: formData.name,
          description: formData.description,
          image_url: formData.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
    } else {
      await supabase.from("categories").insert({
        name: formData.name,
        description: formData.description,
        image_url: formData.imageUrl,
      })
    }

    setFormData({ name: "", description: "", imageUrl: "" })
    setImagePreview(null)
    setShowForm(false)
    setEditingId(null)
    fetchCategories()
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || "",
      imageUrl: category.image_url || "",
    })
    setImagePreview(category.image_url || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await supabase.from("categories").delete().eq("id", id)
      fetchCategories()
    }
  }

  const handleClearImage = () => {
    setFormData({ ...formData, imageUrl: "" })
    setImagePreview(null)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Categories"
        description="Manage your product categories"
        action={
          <Button
            onClick={() => {
              setEditingId(null)
              setFormData({ name: "", description: "", imageUrl: "" })
              setImagePreview(null)
              setShowForm(!showForm)
            }}
          >
            {showForm ? "Cancel" : "Add Category"}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Category" : "Add New Category"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label>Category Image</Label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <label htmlFor="categoryImage" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild disabled={uploading}>
                        <span>
                          <Upload size={16} className="mr-2" />
                          {uploading ? "Uploading..." : "Upload Image"}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="categoryImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Max 5MB. Formats: JPG, PNG, GIF, WebP</p>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!formData.imageUrl}>
                {editingId ? "Update Category" : "Add Category"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No categories yet</CardTitle>
            <CardDescription>Add your first category to get started</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Image</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-border hover:bg-muted">
                  <td className="px-6 py-3">
                    {category.image_url ? (
                      <img
                        src={category.image_url || "/placeholder.svg"}
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded border border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded border border-border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 font-medium">{category.name}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground line-clamp-2">{category.description}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Product, Category } from "@/lib/categories"
import { Edit2, Trash2, X, Upload } from "lucide-react"

interface ProductImage {
  id: string
  image_url: string
  display_order: number
}

interface ProductWithImages extends Product {
  product_images?: ProductImage[]
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingIndices, setUploadingIndices] = useState<Set<number>>(new Set())
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    priceNGN: "",
    priceGBP: "",
    priceUSD: "",
    images: [
      { file: null as File | null, url: "" },
      { file: null as File | null, url: "" },
      { file: null as File | null, url: "" },
      { file: null as File | null, url: "" },
    ],
  })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: productsData } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .order("created_at", { ascending: false })

    const { data: categoriesData } = await supabase.from("categories").select("*").order("name")

    setProducts((productsData as ProductWithImages[]) || [])
    setCategories(categoriesData || [])
    setLoading(false)
  }

  const handleFileChange = async (index: number, file: File) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const newImages = [...formData.images]
      newImages[index] = { file, url: reader.result as string }
      setFormData({ ...formData, images: newImages })
    }
    reader.readAsDataURL(file)

    setUploadingIndices((prev) => new Set(prev).add(index))
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
      
      const newImages = [...formData.images]
      newImages[index] = { file: null, url: data.url }
      setFormData({ ...formData, images: newImages })
    } catch (error) {
      console.error("[v0] Upload failed:", error)
      alert(error instanceof Error ? error.message : "Failed to upload image. Please try again.")
    } finally {
      setUploadingIndices((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setFormError(null)
    setIsSubmitting(true)

    try {
      const validImages = formData.images.filter((img) => img.url.trim())
      if (validImages.length < 2) {
        setFormError("Please upload at least 2 product images")
        setIsSubmitting(false)
        return
      }

      const priceNGN = Number.parseFloat(formData.priceNGN)
      const priceGBP = Number.parseFloat(formData.priceGBP)
      const priceUSD = Number.parseFloat(formData.priceUSD)

      if (!formData.priceNGN || !formData.priceGBP || !formData.priceUSD) {
        setFormError("All price fields (NGN, GBP, USD) are required")
        setIsSubmitting(false)
        return
      }

      if (isNaN(priceNGN) || isNaN(priceGBP) || isNaN(priceUSD)) {
        setFormError("All prices must be valid numbers")
        setIsSubmitting(false)
        return
      }

      if (priceNGN < 0 || priceGBP < 0 || priceUSD < 0) {
        setFormError("Prices cannot be negative")
        setIsSubmitting(false)
        return
      }

      if (!formData.name.trim()) {
        setFormError("Product name is required")
        setIsSubmitting(false)
        return
      }

      console.log("[v0] Submitting product form:", {
        name: formData.name,
        categoryId: formData.categoryId,
        priceNGN: Math.round(priceNGN * 100),
        priceGBP: Math.round(priceGBP * 100),
        priceUSD: Math.round(priceUSD * 100),
        imageCount: validImages.length,
      })

      if (editingId) {
        console.log("[v0] Updating existing product:", editingId)
        const { error: updateError } = await supabase
          .from("products")
          .update({
            name: formData.name,
            description: formData.description,
            category_id: formData.categoryId || null,
            price_ngn: Math.round(priceNGN * 100),
            price_gbp: Math.round(priceGBP * 100),
            price_usd: Math.round(priceUSD * 100),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (updateError) {
          console.error("[v0] Product update error:", updateError)
          throw new Error(`Failed to update product: ${updateError.message}`)
        }

        const { error: deleteError } = await supabase.from("product_images").delete().eq("product_id", editingId)
        if (deleteError) {
          console.error("[v0] Error deleting old images:", deleteError)
          throw new Error(`Failed to delete old images: ${deleteError.message}`)
        }

        const imagesToInsert = validImages.map((img, index) => ({
          product_id: editingId,
          image_url: img.url,
          display_order: index,
        }))

        console.log("[v0] Inserting new images:", imagesToInsert.length)
        const { error: insertError } = await supabase.from("product_images").insert(imagesToInsert)
        if (insertError) {
          console.error("[v0] Error inserting images:", insertError)
          throw new Error(`Failed to insert images: ${insertError.message}`)
        }

        console.log("[v0] Product updated successfully")
      } else {
        console.log("[v0] Creating new product")
        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert({
            name: formData.name,
            description: formData.description,
            category_id: formData.categoryId || null,
            price_ngn: Math.round(priceNGN * 100),
            price_gbp: Math.round(priceGBP * 100),
            price_usd: Math.round(priceUSD * 100),
          })
          .select()
          .single()

        if (insertError) {
          console.error("[v0] Product creation error:", insertError)
          throw new Error(`Failed to create product: ${insertError.message}`)
        }

        if (!newProduct) {
          throw new Error("Failed to retrieve created product")
        }

        console.log("[v0] New product created with ID:", newProduct.id)

        const imagesToInsert = validImages.map((img, index) => ({
          product_id: newProduct.id,
          image_url: img.url,
          display_order: index,
        }))

        console.log("[v0] Inserting images for new product:", imagesToInsert.length)
        const { error: imageError } = await supabase.from("product_images").insert(imagesToInsert)
        if (imageError) {
          console.error("[v0] Error inserting images:", imageError)
          throw new Error(`Failed to insert product images: ${imageError.message}`)
        }

        console.log("[v0] Product and images created successfully")
      }

      setFormData({
        name: "",
        description: "",
        categoryId: "",
        priceNGN: "",
        priceGBP: "",
        priceUSD: "",
        images: [
          { file: null, url: "" },
          { file: null, url: "" },
          { file: null, url: "" },
          { file: null, url: "" },
        ],
      })
      setShowForm(false)
      setEditingId(null)
      await fetchData()
      alert("Product saved successfully!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save product"
      console.error("[v0] Form submission error:", errorMessage)
      setFormError(errorMessage)
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (product: ProductWithImages) => {
    const existingImages = (product.product_images || []).sort((a, b) => a.display_order - b.display_order)

    const newImages = [
      { file: null as File | null, url: "" },
      { file: null as File | null, url: "" },
      { file: null as File | null, url: "" },
      { file: null as File | null, url: "" },
    ]

    existingImages.forEach((img, index) => {
      if (index < 4) {
        newImages[index] = { file: null, url: img.image_url }
      }
    })

    setEditingId(product.id)
    setFormData({
      name: product.name,
      description: product.description || "",
      categoryId: product.category_id || "",
      priceNGN: product.price_ngn ? (product.price_ngn / 100).toString() : "",
      priceGBP: product.price_gbp ? (product.price_gbp / 100).toString() : "",
      priceUSD: product.price_usd ? (product.price_usd / 100).toString() : "",
      images: newImages,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await supabase.from("products").delete().eq("id", id)
      fetchData()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null)
            setFormData({
              name: "",
              description: "",
              categoryId: "",
              priceNGN: "",
              priceGBP: "",
              priceUSD: "",
              images: [
                { file: null, url: "" },
                { file: null, url: "" },
                { file: null, url: "" },
                { file: null, url: "" },
              ],
            })
            setShowForm(!showForm)
          }}
        >
          {showForm ? "Cancel" : "Add Product"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Product" : "Add New Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Product Name</Label>
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
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priceNGN">Price NGN (₦)</Label>
                  <Input
                    id="priceNGN"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceNGN}
                    onChange={(e) => setFormData({ ...formData, priceNGN: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priceGBP">Price GBP (£)</Label>
                  <Input
                    id="priceGBP"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceGBP}
                    onChange={(e) => setFormData({ ...formData, priceGBP: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priceUSD">Price USD ($)</Label>
                  <Input
                    id="priceUSD"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceUSD}
                    onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Product Images (2-4 required)</Label>
                {formData.images.map((image, index) => (
                  <div key={index} className="mb-4 p-4 border border-border rounded">
                    <div className="flex items-center gap-4">
                      {image.url && (
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={`Product ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <Label htmlFor={`image-${index}`} className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 border border-border rounded hover:bg-secondary transition">
                            <Upload size={16} />
                            <span>
                              {image.url ? "Replace" : "Upload"} Image {index + 1}
                            </span>
                          </div>
                        </Label>
                        <input
                          id={`image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileChange(index, e.target.files[0])
                            }
                          }}
                          disabled={uploadingIndices.has(index)}
                          className="hidden"
                        />
                        {uploadingIndices.has(index) && (
                          <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                        )}
                      </div>
                      {image.url && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            const newImages = [...formData.images]
                            newImages[index] = { file: null, url: "" }
                            setFormData({ ...formData, images: newImages })
                          }}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={uploadingIndices.size > 0 || isSubmitting}>
                {uploadingIndices.size > 0
                  ? "Uploading images..."
                  : isSubmitting
                    ? "Saving product..."
                    : editingId
                      ? "Update Product"
                      : "Add Product"}
              </Button>
              {formError && (
                <div className="p-3 bg-destructive text-destructive-foreground rounded text-sm">{formError}</div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No products yet</CardTitle>
            <CardDescription>Add your first product to get started</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Prices</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const category = categories.find((c) => c.id === product.category_id)
                return (
                  <tr key={product.id} className="border-b border-border hover:bg-muted">
                    <td className="px-6 py-3">{product.name}</td>
                    <td className="px-6 py-3 text-sm">{category?.name || "Uncategorized"}</td>
                    <td className="px-6 py-3 text-sm">
                      ₦{(product.price_ngn || 0) / 100} / £{(product.price_gbp || 0) / 100} / ${(product.price_usd || 0) / 100}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

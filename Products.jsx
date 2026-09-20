import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import toast from 'react-hot-toast'

const categories = [
  'All',
  'Kurti',
  'Dress',
  'Co-ord Set',
  'Handbag',
  'Sling Bag'
]

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)

      try {
        const category = searchParams.get('category') || 'all'
        const search = searchParams.get('search') || ''
        const page = searchParams.get('page') || 1

        const response = await axios.get('/api/products', {
          params: {
            category,
            search,
            page,
            limit: 12
          }
        })

        const data = response.data

        setProducts(data.products || [])
        setTotalPages(data.totalPages || 1)
        setCurrentPage(data.currentPage || 1)

        if (category === 'all') {
          setSelectedCategory('All')
        } else {
          setSelectedCategory(category)
        }

        setSearchQuery(search)

      } catch (error) {
        console.error('Products error:', error)
        toast.error('Failed to load products')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams])

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams()

    if (category !== 'All') {
      params.set('category', category)
    }

    if (searchQuery) {
      params.set('search', searchQuery)
    }

    params.set('page', '1')

    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()

    const params = new URLSearchParams()

    if (selectedCategory !== 'All') {
      params.set('category', selectedCategory)
    }

    if (searchQuery) {
      params.set('search', searchQuery)
    }

    params.set('page', '1')

    setSearchParams(params)
  }

  const handlePageChange = (page) => {
    const params = new URLSearchParams()

    if (selectedCategory !== 'All') {
      params.set('category', selectedCategory)
    }

    if (searchQuery) {
      params.set('search', searchQuery)
    }

    params.set('page', page)

    setSearchParams(params)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSearchParams({})
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">
            Loading products...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">
          Women's Fashion
        </h1>

        <p className="text-gray-500 mt-2">
          Explore our latest collection
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">

        <div className="flex flex-col gap-4">

          {/* Search */}
          <form onSubmit={handleSearch}>
            <div className="relative">

              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full pr-20"
              />

              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Search
              </button>

            </div>
          </form>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">

            {categories.map((category) => (

              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>

            ))}

          </div>

        </div>
      </div>

      {/* Products */}
      {products.length > 0 ? (

        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {products.map((product) => (

              <ProductCard
                key={product._id}
                product={product}
              />

            ))}

          </div>

          {/* Pagination */}
          {totalPages > 1 && (

            <div className="flex justify-center items-center gap-2">

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (

                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg font-medium ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>

              ))}

            </div>

          )}

        </>

      ) : (

        <div className="text-center py-16">

          <div className="text-6xl mb-4">
            🛍️
          </div>

          <h2 className="text-xl font-bold mb-2">
            No products found
          </h2>

          <p className="text-gray-500 mb-6">
            Try another search or category.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Clear Filters
          </button>

        </div>

      )}

    </div>
  )
}

export default Products
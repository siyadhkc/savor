import { useState, useEffect } from 'react'
import api from '../api/axios'
import RestaurantCard from '../components/RestaurantCard'
import toast from 'react-hot-toast'

const Home = () => {
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    /*
    WHY these states?
    restaurants → the list from API
    loading     → show spinner while fetching
    search      → controlled input for search bar
    currentPage → which page of results we're on
    totalPages  → how many pages exist (from API)
    
    PDF requires: search, filter, and pagination
    on listing pages. All three are handled here.
    */

    useEffect(() => {
        fetchRestaurants()
    }, [currentPage])
    /*
    WHY [currentPage] in dependency array?
    useEffect re-runs whenever currentPage changes.
    When user clicks page 2, currentPage updates,
    useEffect fires, and fetches page 2 data.
    This is how pagination works in React.
    */

    const fetchRestaurants = async () => {
        setLoading(true)
        try {
            const response = await api.get('/restaurant/restaurants/', {
                params: {
                    page: currentPage,
                    search: search,
                    is_active: true,
                }
                /*
                WHY params object?
                Axios converts this to query string automatically:
                /restaurant/restaurants/?page=1&search=pizza&is_active=true
                This hits our DRF search + filter + pagination
                that we built in the backend.
                */
            })
            setRestaurants(response.data.results)
            /*
            WHY response.data.results?
            DRF pagination wraps the list in an object:
            {
                count: 20,
                next: "...?page=2",
                previous: null,
                results: [...actual data...]
            }
            The actual list is in .results not .data directly.
            BEGINNER MISTAKE: using response.data and wondering
            why you can't map over it — it's an object, not array.
            */
            setTotalPages(Math.ceil(response.data.count / 10))
        } catch (error) {
            toast.error('Failed to load restaurants.')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(1)
        /*
        WHY reset to page 1 on search?
        If you're on page 3 and search for "pizza",
        results might only have 1 page. Always reset
        to page 1 when search changes.
        */
        fetchRestaurants()
    }

    return (
        <div style={styles.page}>

            {/* Hero Section */}
            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>
                    Order Food You Love 🍕
                </h1>
                <p style={styles.heroSubtitle}>
                    Fast delivery from the best restaurants near you
                </p>

                {/* Search Bar — PDF requirement */}
                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search restaurants..."
                        style={styles.searchInput}
                    />
                    <button type="submit" style={styles.searchBtn}>
                        🔍 Search
                    </button>
                </form>
            </div>

            {/* Restaurant Grid */}
            <div style={styles.container}>
                <h2 style={styles.sectionTitle}>
                    {search ? `Results for "${search}"` : 'All Restaurants'}
                </h2>

                {loading ? (
                    <div style={styles.center}>
                        <p>Loading restaurants... 🍔</p>
                    </div>
                ) : restaurants.length === 0 ? (
                    <div style={styles.center}>
                        <p>No restaurants found. Try a different search!</p>
                    </div>
                ) : (
                    <>
                        {/* Restaurant Cards Grid */}
                        <div style={styles.grid}>
                            {restaurants.map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    /*
                                    WHY key={restaurant.id}?
                                    React uses key to efficiently update the DOM.
                                    Without key, React re-renders ALL cards on
                                    any change. With unique keys, only changed
                                    cards re-render — much better performance.
                                    BEGINNER MISTAKE: using index as key —
                                    causes bugs when list order changes.
                                    Always use a unique ID as key.
                                    */
                                />
                            ))}
                        </div>

                        {/* Pagination — PDF requirement */}
                        {totalPages > 1 && (
                            <div style={styles.pagination}>
                                <button
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    disabled={currentPage === 1}
                                    style={currentPage === 1
                                        ? styles.pageButtonDisabled
                                        : styles.pageButton
                                    }
                                >
                                    ← Previous
                                </button>

                                <span style={styles.pageInfo}>
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage === totalPages}
                                    style={currentPage === totalPages
                                        ? styles.pageButtonDisabled
                                        : styles.pageButton
                                    }
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
    },
    hero: {
        backgroundColor: '#ff4500',
        padding: '60px 20px',
        textAlign: 'center',
    },
    heroTitle: {
        color: 'white',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '12px',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: '1.1rem',
        marginBottom: '30px',
    },
    searchForm: {
        display: 'flex',
        maxWidth: '500px',
        margin: '0 auto',
        gap: '8px',
    },
    searchInput: {
        flex: 1,
        padding: '14px 18px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '1rem',
        outline: 'none',
    },
    searchBtn: {
        padding: '14px 20px',
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '24px',
        color: '#333',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
        /*
        WHY auto-fill with minmax?
        This is responsive CSS grid — no media queries needed.
        auto-fill: fit as many columns as possible
        minmax(300px, 1fr): each column is at least 300px
        On wide screens: 3-4 columns
        On tablets: 2 columns
        On mobile: 1 column
        Automatically responsive without breakpoints!
        */
    },
    center: {
        textAlign: 'center',
        padding: '60px',
        color: '#666',
        fontSize: '1.1rem',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginTop: '40px',
    },
    pageButton: {
        padding: '10px 20px',
        backgroundColor: '#ff4500',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    pageButtonDisabled: {
        padding: '10px 20px',
        backgroundColor: '#ccc',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'not-allowed',
    },
    pageInfo: {
        color: '#666',
        fontWeight: '500',
    },
}

export default Home
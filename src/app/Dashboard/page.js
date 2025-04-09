"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Edit, Trash2, Plus, X, Save } from 'lucide-react';
import { 
  getCurrentWeekMenu, 
  getAllMenus, 
  createMenu as apiCreateMenu, 
  updateMenu as apiUpdateMenu, 
  deleteMenu as apiDeleteMenu 
} from '../lib/api';


const MenuAdminPanel = () => {
  // State declarations - organized by purpose
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('week'); // 'week', 'all', 'create', 'edit'
  const [selectedMenu, setSelectedMenu] = useState(null);
  
  // Memoize date values to prevent unnecessary re-renders
  const today = React.useMemo(() => new Date().toLocaleDateString('en-CA'), []); // 'YYYY-MM-DD' in local time
  const tomorrow = React.useMemo(() => {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    return tomorrowDate.toLocaleDateString('en-CA');
  }, []);

  // Form state with proper defaults to prevent null/undefined issues
  const [formData, setFormData] = useState({
    date: today,
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: []
  });

  // Memoize fetch functions to prevent recreation on each render
  const fetchWeekMenus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentWeekMenu();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received");
      }
      
      // Process data with defensive programming
      const processedData = data.map(menu => {
        if (!menu) return null;
        
        return {
          ...menu,
          // Safely handle different input formats with nullish coalescing
          breakfast: Array.isArray(menu.breakfast) 
            ? menu.breakfast 
            : (typeof menu.breakfast === 'string' ? menu.breakfast.split(',').map(item => item.trim()) : []),
          lunch: Array.isArray(menu.lunch) 
            ? menu.lunch 
            : (typeof menu.lunch === 'string' ? menu.lunch.split(',').map(item => item.trim()) : []),
          snacks: Array.isArray(menu.snacks) 
            ? menu.snacks 
            : (typeof menu.snacks === 'string' ? menu.snacks.split(',').map(item => item.trim()) : []),
          dinner: Array.isArray(menu.dinner) 
            ? menu.dinner 
            : (typeof menu.dinner === 'string' ? menu.dinner.split(',').map(item => item.trim()) : []),
          // Set flags
          isToday: menu.date === today,
          isTomorrow: menu.date === tomorrow
        };
      }).filter(Boolean); // Filter out null items
      
      setMenus(processedData);
      setCurrentView('week');
    } catch (err) {
      console.error("Error fetching weekly menus:", err);
      setError(err?.message || "Failed to fetch weekly menus");
    } finally {
      setLoading(false);
    }
  }, [today, tomorrow]);

  const fetchAllMenus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllMenus();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received");
      }
      
      // Process data with defensive programming
      const processedData = data.map(menu => {
        if (!menu) return null;
        
        return {
          ...menu,
          // Safely handle different input formats
          breakfast: Array.isArray(menu.breakfast) 
            ? menu.breakfast 
            : (typeof menu.breakfast === 'string' ? menu.breakfast.split(',').map(item => item.trim()) : []),
          lunch: Array.isArray(menu.lunch) 
            ? menu.lunch 
            : (typeof menu.lunch === 'string' ? menu.lunch.split(',').map(item => item.trim()) : []),
          snacks: Array.isArray(menu.snacks) 
            ? menu.snacks 
            : (typeof menu.snacks === 'string' ? menu.snacks.split(',').map(item => item.trim()) : []),
          dinner: Array.isArray(menu.dinner) 
            ? menu.dinner 
            : (typeof menu.dinner === 'string' ? menu.dinner.split(',').map(item => item.trim()) : []),
          // Set flags
          isToday: menu.date === today,
          isTomorrow: menu.date === tomorrow
        };
      }).filter(Boolean); // Filter out null items
      
      setMenus(processedData);
      setCurrentView('all');
    } catch (err) {
      console.error("Error fetching all menus:", err);
      setError(err?.message || "Failed to fetch all menus");
    } finally {
      setLoading(false);
    }
  }, [today, tomorrow]);

  // Initial data loading and date change checker
  useEffect(() => {
    fetchWeekMenus();
    
    // Set up a timer to check for date change every minute
    const dateCheckInterval = setInterval(() => {
      const currentDate = new Date().toLocaleDateString('en-CA');
      if (currentDate !== today) {
        window.location.reload(); // Refresh to update today and tomorrow
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(dateCheckInterval);
  }, [fetchWeekMenus, today]);

  // Form reset with safe defaults
  const resetForm = useCallback(() => {
    setFormData({
      date: today,
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: []
    });
    setSelectedMenu(null);
    setCurrentView(prevView => prevView === 'edit' || prevView === 'create' ? 'week' : prevView);
  }, [today]);

  // **CRUD Functions with error handling and validation**
  const createMenu = async () => {
    if (!formData.date) {
      setError("Date is required");
      return;
    }
    
    try {
      // Safely filter and join items, preventing empty string issues
      const cleanFormData = {
        date: formData.date,
        breakfast: Array.isArray(formData.breakfast) 
          ? formData.breakfast.filter(item => item && item.trim() !== '').join(', ')
          : '',
        lunch: Array.isArray(formData.lunch)
          ? formData.lunch.filter(item => item && item.trim() !== '').join(', ')
          : '',
        snacks: Array.isArray(formData.snacks)
          ? formData.snacks.filter(item => item && item.trim() !== '').join(', ')
          : '',
        dinner: Array.isArray(formData.dinner)
          ? formData.dinner.filter(item => item && item.trim() !== '').join(', ')
          : ''
      };
      
      await apiCreateMenu(cleanFormData);
      
      // Refresh data based on current view
      if (currentView === 'create' || currentView === 'week') {
        await fetchWeekMenus();
      } else if (currentView === 'all') {
        await fetchAllMenus();
      }
      resetForm();
    } catch (err) {
      console.error("Error creating menu:", err);
      setError(err?.message || "Failed to create menu");
    }
  };

  const updateMenu = async () => {
    if (!selectedMenu?._id) {
      setError("No menu selected for update");
      return;
    }
    
    try {
      // Safely filter and join items
      const cleanFormData = {
        breakfast: Array.isArray(formData.breakfast)
          ? formData.breakfast.filter(item => item && item.trim() !== '').join(', ')
          : '',
        lunch: Array.isArray(formData.lunch)
          ? formData.lunch.filter(item => item && item.trim() !== '').join(', ')
          : '',
        snacks: Array.isArray(formData.snacks)
          ? formData.snacks.filter(item => item && item.trim() !== '').join(', ')
          : '',
        dinner: Array.isArray(formData.dinner)
          ? formData.dinner.filter(item => item && item.trim() !== '').join(', ')
          : ''
      };
      
      await apiUpdateMenu(selectedMenu._id, cleanFormData);
      
      // Refresh data based on current view
      if (currentView === 'edit' || currentView === 'week') {
        await fetchWeekMenus();
      } else if (currentView === 'all') {
        await fetchAllMenus();
      }
      resetForm();
    } catch (err) {
      console.error("Error updating menu:", err);
      setError(err?.message || "Failed to update menu");
    }
  };

  const deleteMenu = async (id) => {
    if (!id) {
      setError("No menu ID provided for deletion");
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this menu?')) return;

    try {
      await apiDeleteMenu(id);
      
      // Refresh data based on current view
      if (currentView === 'week') {
        await fetchWeekMenus();
      } else {
        await fetchAllMenus();
      }
    } catch (err) {
      console.error("Error deleting menu:", err);
      setError(err?.message || "Failed to delete menu");
    }
  };

  // **Helper Functions**
  const handleEditMenu = useCallback((menu) => {
    if (!menu) return;
    
    setSelectedMenu(menu);
    setFormData({
      date: menu.date || today,
      // Ensure arrays with defensive programming
      breakfast: Array.isArray(menu.breakfast) 
        ? [...menu.breakfast] 
        : (typeof menu.breakfast === 'string' ? menu.breakfast.split(',').map(item => item.trim()) : []),
      lunch: Array.isArray(menu.lunch) 
        ? [...menu.lunch] 
        : (typeof menu.lunch === 'string' ? menu.lunch.split(',').map(item => item.trim()) : []),
      snacks: Array.isArray(menu.snacks) 
        ? [...menu.snacks] 
        : (typeof menu.snacks === 'string' ? menu.snacks.split(',').map(item => item.trim()) : []),
      dinner: Array.isArray(menu.dinner) 
        ? [...menu.dinner] 
        : (typeof menu.dinner === 'string' ? menu.dinner.split(',').map(item => item.trim()) : [])
    });
    
    setCurrentView('edit');
  }, [today]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMealItemChange = useCallback((mealType, index, value) => {
    setFormData(prev => {
      // Create a safe copy of the meal items array
      const mealItems = Array.isArray(prev[mealType]) ? [...prev[mealType]] : [];
      // Update the value at the specified index
      mealItems[index] = value;
      return { ...prev, [mealType]: mealItems };
    });
  }, []);

  const addMealItem = useCallback((mealType) => {
    setFormData(prev => {
      // Create a safe copy of the meal items array
      const mealItems = Array.isArray(prev[mealType]) ? [...prev[mealType]] : [];
      return { ...prev, [mealType]: [...mealItems, ''] };
    });
  }, []);

  const removeMealItem = useCallback((mealType, index) => {
    setFormData(prev => {
      // Create a safe copy of the meal items array and filter out the index
      const mealItems = Array.isArray(prev[mealType]) 
        ? prev[mealType].filter((_, i) => i !== index) 
        : [];
      return { ...prev, [mealType]: mealItems };
    });
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Invalid date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return 'Invalid date';
    }
  }, []);

  // Loading state with fallback UI
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-screen ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu data...</p>
        </div>
      </div>
    );
  }

  // **Render**
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 ">Menu Administration</h1>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            
           {/* Replace this in the header navigation section: */}
<div>
  <button
    onClick={() => window.location.href = '/feedback'}  // Adjust path as needed
    className="px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 flex items-center gap-1"
    aria-label="Go to feedback page"
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
    Feedback
  </button>
</div>
           
            <button
              onClick={fetchWeekMenus}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${
                currentView === 'week' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Calendar size={16} />
              Current Week
            </button>
            <button
              onClick={fetchAllMenus}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${
                currentView === 'all' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Calendar size={16} />
              All Menus
            </button>
            <button
              onClick={() => {
                resetForm();
                setCurrentView('create');
              }}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${
                currentView === 'create' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Plus size={16} />
              New Menu
            </button>
          </div>

          {/* Error Display with dismissal */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </header>

        {/* Create/Edit Form */}
        {(currentView === 'create' || currentView === 'edit') && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentView === 'create' ? 'Create New Menu' : 'Edit Menu'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="menu-date">Date</label>
              <input
                id="menu-date"
                type="date"
                name="date"
                value={formData.date || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={currentView === 'edit'}
                required
              />
            </div>

            {/* Meal Sections */}
            {['breakfast', 'lunch', 'snacks', 'dinner'].map(mealType => (
              <div key={mealType} className="mb-6 ">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-gray-700 capitalize">
                    {mealType}
                  </h3>
                  <button
                    type="button"
                    onClick={() => addMealItem(mealType)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    aria-label={`Add ${mealType} item`}
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {Array.isArray(formData[mealType]) && formData[mealType].map((item, index) => (
                    <div key={`${mealType}-${index}`} className="flex gap-2 items-center ">
                      <input
                        type="text"
                        value={item || ''}
                        onChange={(e) => handleMealItemChange(mealType, index, e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter ${mealType} item...`}
                        aria-label={`${mealType} item ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeMealItem(mealType, index)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                        aria-label={`Remove ${mealType} item ${index + 1}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-2 justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={currentView === 'create' ? createMenu : updateMenu}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <Save size={16} />
                {currentView === 'create' ? 'Create New Menu' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Menu List Display */}
        {(currentView === 'week' || currentView === 'all') && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 ">
              {currentView === 'week' ? 'Current Week Menus' : 'All Menus'}
            </h2>

            {!menus || menus.length === 0 ? (
              <div className="bg-white p-6 text-center rounded-lg border border-dashed border-gray-300 text-gray-500">
                No menus found. Click "New Menu" to create one.
              </div>
            ) : (
              <div className="space-y-4 ">
                {menus.map(menu => menu && menu._id ? (
                  <div 
                    key={menu._id} 
                    className={`bg-gradient-to-r from-amber-400 to-orange-600 shadow-sm rounded-lg border hover:shadow-md transition-shadow ${
                      menu.isToday 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : menu.isTomorrow 
                          ? 'border-green-500 ring-1 ring-green-200' 
                          : 'border-gray-200'
                    }`}
                  >
                    <div className={`p-4 border-b flex justify-between items-center ${
                      menu.isToday 
                        ? 'bg-blue-50 border-blue-200' 
                        : menu.isTomorrow 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3 ">
                        <Calendar size={18} className={menu.isToday ? 'text-blue-600' : menu.isTomorrow ? 'text-green-600' : 'text-gray-500'} />
                        <h3 className="font-medium text-gray-900">
                          {formatDate(menu.date)}
                          {menu.isToday && <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Today</span>}
                          {menu.isTomorrow && <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">Tomorrow</span>}
                        </h3>
                      </div>
                      <div className="flex gap-2 ">
                        <button
                          type="button"
                          onClick={() => handleEditMenu(menu)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                          aria-label={`Edit menu for ${formatDate(menu.date)}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMenu(menu._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                          aria-label={`Delete menu for ${formatDate(menu.date)}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ">
                      {['breakfast', 'lunch', 'snacks', 'dinner'].map(mealType => (
                        <div key={`${menu._id}-${mealType}`} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                          <h4 className="font-medium text-gray-900 text-sm uppercase mb-2 tracking-wide">
                            {mealType}
                          </h4>
                          {menu[mealType] && Array.isArray(menu[mealType]) && menu[mealType].length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                              {menu[mealType].map((item, index) => item && (
                                <li key={`${menu._id}-${mealType}-${index}`} className="text-gray-700 text-sm">{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400 text-sm italic">No items</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuAdminPanel;
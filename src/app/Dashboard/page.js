"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Edit, Trash2, Plus, X, Save } from 'lucide-react';
import { 
  getCurrentWeekMenu, 
  getAllMenus, 
  createMenu as apiCreateMenu, 
  updateMenu as apiUpdateMenu, 
  deleteMenu as apiDeleteMenu 
} from '../lib/api';

const MenuAdminPanel = () => {
  // State declarations
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('week'); // 'week', 'all', 'create', 'edit'
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('en-CA'),
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: []
  });
  // Track today and tomorrow using local dates
  const [today] = useState(new Date().toLocaleDateString('en-CA')); // 'YYYY-MM-DD' in local time
  const [tomorrow] = useState(() => {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    return tomorrowDate.toLocaleDateString('en-CA');
  });

  // Fetch current week menus on mount and check for date changes
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
  }, []);

  // **Fetch Functions**
  const fetchWeekMenus = async () => {
    setLoading(true);
    try {
      const data = await getCurrentWeekMenu();
      
      // Process data, assuming menu.date is 'YYYY-MM-DD' in local time
      const processedData = data.map(menu => ({
        ...menu,
        breakfast: Array.isArray(menu.breakfast) ? menu.breakfast : (menu.breakfast?.split(',').map(item => item.trim()) || []),
        lunch: Array.isArray(menu.lunch) ? menu.lunch : (menu.lunch?.split(',').map(item => item.trim()) || []),
        snacks: Array.isArray(menu.snacks) ? menu.snacks : (menu.snacks?.split(',').map(item => item.trim()) || []),
        dinner: Array.isArray(menu.dinner) ? menu.dinner : (menu.dinner?.split(',').map(item => item.trim()) || []),
        // Set flags using direct string comparison
        isToday: menu.date === today,
        isTomorrow: menu.date === tomorrow
      }));
      
      setMenus(processedData);
      setCurrentView('week');
    } catch (err) {
      setError(err?.message || "Failed to fetch weekly menus");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMenus = async () => {
    setLoading(true);
    try {
      const data = await getAllMenus();
      
      // Process data, assuming menu.date is 'YYYY-MM-DD' in local time
      const processedData = data.map(menu => ({
        ...menu,
        breakfast: Array.isArray(menu.breakfast) ? menu.breakfast : (menu.breakfast?.split(',').map(item => item.trim()) || []),
        lunch: Array.isArray(menu.lunch) ? menu.lunch : (menu.lunch?.split(',').map(item => item.trim()) || []),
        snacks: Array.isArray(menu.snacks) ? menu.snacks : (menu.snacks?.split(',').map(item => item.trim()) || []),
        dinner: Array.isArray(menu.dinner) ? menu.dinner : (menu.dinner?.split(',').map(item => item.trim()) || []),
        // Set flags using direct string comparison
        isToday: menu.date === today,
        isTomorrow: menu.date === tomorrow
      }));
      
      setMenus(processedData);
      setCurrentView('all');
    } catch (err) {
      setError(err?.message || "Failed to fetch all menus");
    } finally {
      setLoading(false);
    }
  };

  // **CRUD Functions**
  const createMenu = async () => {
    try {
      const cleanFormData = {
        date: formData.date,
        breakfast: formData.breakfast.filter(item => item?.trim() !== '').join(', '),
        lunch: formData.lunch.filter(item => item?.trim() !== '').join(', '),
        snacks: formData.snacks.filter(item => item?.trim() !== '').join(', '),
        dinner: formData.dinner.filter(item => item?.trim() !== '').join(', ')
      };
      
      await apiCreateMenu(cleanFormData);
      if (currentView === 'create' || currentView === 'week') {
        await fetchWeekMenus();
      } else if (currentView === 'all') {
        await fetchAllMenus();
      }
      resetForm();
    } catch (err) {
      setError(err?.message || "Failed to create menu");
    }
  };

  const updateMenu = async () => {
    if (!selectedMenu?._id) {
      setError("No menu selected for update");
      return;
    }
    
    try {
      const cleanFormData = {
        breakfast: formData.breakfast.filter(item => item?.trim() !== '').join(', '),
        lunch: formData.lunch.filter(item => item?.trim() !== '').join(', '),
        snacks: formData.snacks.filter(item => item?.trim() !== '').join(', '),
        dinner: formData.dinner.filter(item => item?.trim() !== '').join(', ')
      };
      
      await apiUpdateMenu(selectedMenu._id, cleanFormData);
      if (currentView === 'edit' || currentView === 'week') {
        await fetchWeekMenus();
      } else if (currentView === 'all') {
        await fetchAllMenus();
      }
      resetForm();
    } catch (err) {
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
      if (currentView === 'week') {
        await fetchWeekMenus();
      } else {
        await fetchAllMenus();
      }
    } catch (err) {
      setError(err?.message || "Failed to delete menu");
    }
  };

  // **Helper Functions**
  const resetForm = () => {
    setFormData({
      date: new Date().toLocaleDateString('en-CA'),
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: []
    });
    setSelectedMenu(null);
    setCurrentView(prevView => prevView === 'edit' || prevView === 'create' ? 'week' : prevView);
  };

  const handleEditMenu = (menu) => {
    if (!menu) return;
    
    setSelectedMenu(menu);
    setFormData({
      date: menu.date, // Use menu.date directly as it's 'YYYY-MM-DD' in local time
      breakfast: Array.isArray(menu.breakfast) ? [...menu.breakfast] : (menu.breakfast?.split(',').map(item => item.trim()) || []),
      lunch: Array.isArray(menu.lunch) ? [...menu.lunch] : (menu.lunch?.split(',').map(item => item.trim()) || []),
      snacks: Array.isArray(menu.snacks) ? [...menu.snacks] : (menu.snacks?.split(',').map(item => item.trim()) || []),
      dinner: Array.isArray(menu.dinner) ? [...menu.dinner] : (menu.dinner?.split(',').map(item => item.trim()) || [])
    });
    
    setCurrentView('edit');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMealItemChange = (mealType, index, value) => {
    const updatedItems = [...formData[mealType]];
    updatedItems[index] = value;
    setFormData(prev => ({ ...prev, [mealType]: updatedItems }));
  };

  const addMealItem = (mealType) => {
    setFormData(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], '']
    }));
  };

  const removeMealItem = (mealType, index) => {
    setFormData(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString) => {
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
      return 'Invalid date';
    }
  };

  // **Render**
  if (loading) return <div className="flex justify-center p-8">Loading menu data...</div>;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Menu Administration</h1>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
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
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={currentView === 'edit'}
              />
            </div>

            {/* Meal Sections */}
            {['breakfast', 'lunch', 'snacks', 'dinner'].map(mealType => (
              <div key={mealType} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-gray-700 capitalize">
                    {mealType}
                  </h3>
                  <button
                    type="button"
                    onClick={() => addMealItem(mealType)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {formData[mealType].map((item, index) => (
                    <div key={`${mealType}-${index}`} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item || ''}
                        onChange={(e) => handleMealItemChange(mealType, index, e.target.value)}
                        className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter ${mealType} item...`}
                      />
                      <button
                        type="button"
                        onClick={() => removeMealItem(mealType, index)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentView === 'week' ? 'Current Week Menus' : 'All Menus'}
            </h2>

            {menus.length === 0 ? (
              <div className="bg-white p-6 text-center rounded-lg border border-dashed border-gray-300 text-gray-500">
                No menus found. Click "New Menu" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {menus.map(menu => menu && menu._id ? (
                  <div 
                    key={menu._id} 
                    className={`bg-white shadow-sm rounded-lg border hover:shadow-md transition-shadow ${
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
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className={menu.isToday ? 'text-blue-600' : menu.isTomorrow ? 'text-green-600' : 'text-gray-500'} />
                        <h3 className="font-medium text-gray-900">
                          {formatDate(menu.date)}
                          {menu.isToday && <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Today</span>}
                          {menu.isTomorrow && <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">Tomorrow</span>}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditMenu(menu)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMenu(menu._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
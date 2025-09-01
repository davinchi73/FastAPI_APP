// API Configuration
const API_BASE_URL = '';  // Empty since we're serving from the same origin
const API_ENDPOINTS = {
    items: '/api/items/',
    itemById: (id) => `/api/items/${id}`
};

// DOM Elements
const itemForm = document.getElementById('itemForm');
const responseBox = document.getElementById('response');
const itemsList = document.getElementById('itemsList');
const itemCount = document.getElementById('itemCount');

// State management
let items = [];
let isLoading = false;

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
    setupEventListeners();
    loadItems();
});

// Event Listeners Setup
function setupEventListeners() {
    itemForm.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const priceInput = document.getElementById('price');
    priceInput.addEventListener('input', validatePrice);
    
    const nameInput = document.getElementById('name');
    nameInput.addEventListener('input', validateName);
}

// Form submission handler (POST request)
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    const formData = new FormData(event.target);
    const itemData = {
        name: formData.get('name').trim(),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        description: formData.get('description')?.trim() || null
    };
    
    // Client-side validation
    if (!validateItemData(itemData)) {
        return;
    }
    
    setLoading(true);
    updateResponse('Sending POST request...', 'loading');
    
    try {
        const response = await fetch(API_ENDPOINTS.items, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            updateResponse(
                `✅ SUCCESS (${response.status})\n\n${JSON.stringify(result, null, 2)}`,
                'success'
            );
            
            // Reset form and reload items
            itemForm.reset();
            await loadItems();
            
            // Show success animation
            showSuccessMessage(`"${itemData.name}" created successfully!`);
            
        } else {
            updateResponse(
                `❌ ERROR (${response.status})\n\n${JSON.stringify(result, null, 2)}`,
                'error'
            );
        }
        
    } catch (error) {
        console.error('POST request failed:', error);
        updateResponse(
            `❌ NETWORK ERROR\n\nFailed to connect to server: ${error.message}`,
            'error'
        );
    } finally {
        setLoading(false);
    }
}

// Load all items (GET request)
async function loadItems() {
    if (isLoading) return;
    
    setLoading(true);
    updateItemsList('<div class="loading">Loading items...</div>');
    
    try {
        const response = await fetch(API_ENDPOINTS.items);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        items = result.items || [];
        
        renderItems();
        updateItemCount();
        
        console.log(`Loaded ${items.length} items`);
        
    } catch (error) {
        console.error('Failed to load items:', error);
        updateItemsList(`
            <div class="empty-state">
                <h3>Failed to load items</h3>
                <p>${error.message}</p>
                <button class="btn btn-secondary" onclick="loadItems()">
                    Try Again
                </button>
            </div>
        `);
    } finally {
        setLoading(false);
    }
}

// Delete item (DELETE request)
async function deleteItem(itemId) {
    if (isLoading) return;
    
    const itemName = items.find(item => item.id === itemId)?.name || 'Unknown';
    
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
        return;
    }
    
    setLoading(true);
    updateResponse(`Deleting item ${itemId}...`, 'loading');
    
    try {
        const response = await fetch(API_ENDPOINTS.itemById(itemId), {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            updateResponse(
                `✅ DELETED\n\n${JSON.stringify(result, null, 2)}`,
                'success'
            );
            
            // Remove from local array and re-render
            items = items.filter(item => item.id !== itemId);
            renderItems();
            updateItemCount();
            
            showSuccessMessage(`"${itemName}" deleted successfully!`);
            
        } else {
            updateResponse(
                `❌ DELETE FAILED (${response.status})\n\n${JSON.stringify(result, null, 2)}`,
                'error'
            );
        }
        
    } catch (error) {
        console.error('Delete request failed:', error);
        updateResponse(
            `❌ DELETE ERROR\n\n${error.message}`,
            'error'
        );
    } finally {
        setLoading(false);
    }
}

// Render items to the DOM
function renderItems() {
    if (items.length === 0) {
        updateItemsList(`
            <div class="empty-state">
                <h3>No items yet</h3>
                <p>Create your first item using the form above!</p>
            </div>
        `);
        return;
    }
    
    const itemsHTML = items.map(item => `
        <div class="item" data-item-id="${item.id}">
            <h3>${escapeHtml(item.name)}</h3>
            <div class="item-price">$${item.price.toFixed(2)}</div>
            <div class="item-category">${escapeHtml(item.category)}</div>
            ${item.description ? `<div class="item-description">${escapeHtml(item.description)}</div>` : ''}
            <div class="item-id">ID: ${item.id}</div>
            <button class="btn btn-danger" onclick="deleteItem(${item.id})">
                🗑️ Delete
            </button>
        </div>
    `).join('');
    
    updateItemsList(itemsHTML);
}

// Validation functions
function validateItemData(data) {
    if (!data.name || data.name.length < 2) {
        updateResponse('❌ VALIDATION ERROR\n\nItem name must be at least 2 characters', 'error');
        return false;
    }
    
    if (!data.price || data.price <= 0) {
        updateResponse('❌ VALIDATION ERROR\n\nPrice must be greater than 0', 'error');
        return false;
    }
    
    if (!data.category) {
        updateResponse('❌ VALIDATION ERROR\n\nPlease select a category', 'error');
        return false;
    }
    
    return true;
}

function validatePrice(event) {
    const value = parseFloat(event.target.value);
    const input = event.target;
    
    if (value <= 0) {
        input.setCustomValidity('Price must be greater than 0');
    } else {
        input.setCustomValidity('');
    }
}

function validateName(event) {
    const value = event.target.value.trim();
    const input = event.target;
    
    if (value.length < 2) {
        input.setCustomValidity('Name must be at least 2 characters');
    } else {
        input.setCustomValidity('');
    }
}

// UI Helper functions
function updateResponse(message, type = '') {
    responseBox.textContent = message;
    responseBox.className = `response-box ${type}`;
}

function updateItemsList(html) {
    itemsList.innerHTML = html;
}

function updateItemCount() {
    const count = items.length;
    itemCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
}

function setLoading(loading) {
    isLoading = loading;
    const submitButton = itemForm.querySelector('button[type="submit"]');
    const refreshButton = document.querySelector('button[onclick="loadItems()"]');
    
    if (loading) {
        submitButton.textContent = 'Creating...';
        submitButton.disabled = true;
        refreshButton.textContent = 'Loading...';
        refreshButton.disabled = true;
    } else {
        submitButton.textContent = 'Create Item';
        submitButton.disabled = false;
        refreshButton.textContent = 'Refresh Items';
        refreshButton.disabled = false;
    }
}

function showSuccessMessage(message) {
    // Create temporary success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 600;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions for global access (for onclick handlers)
window.loadItems = loadItems;
window.deleteItem = deleteItem;
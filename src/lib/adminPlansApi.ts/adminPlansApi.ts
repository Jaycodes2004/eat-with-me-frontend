import apiClient from './api';

// Fetch all plans from admin backend
export const fetchPlans = async () => {
  try {
    const response = await apiClient.get('/admin/plans');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
};

// Fetch a specific plan by ID
export const fetchPlanById = async (planId: string) => {
  try {
    const response = await apiClient.get(`/admin/plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching plan ${planId}:`, error);
    return null;
  }
};

// Format plans for display
export const formatPlansForDisplay = (plans: any[]) => {
  return plans.map((plan) => ({
    id: plan._id || plan.id,
    name: plan.name,
    description: plan.description || '',
    monthlyPrice: plan.price || 0,
    currency: plan.currency || '$',
    period: plan.period || 'per month',
    features: plan.features || [],
    featureHighlights: plan.featureHighlights || [],
    allowedModules: plan.allowedModules || [],
    popular: plan.popular || false,
    color: plan.color || 'from-gray-400 to-gray-600',
  }));
};

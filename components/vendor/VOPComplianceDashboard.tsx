'use client';

import React from 'react';
import { VOPComplianceService } from '@/lib/services/vop-compliance-service';

interface Product {
  id: string;
  name: string;
  description?: string;
  ingredients?: string[];
  certifications?: string[];
  tags?: string[];
  category?: string;
  allergens?: string[];
  vopCompliance?: any;
}

interface VOPComplianceDashboardProps {
  products: Product[];
}

export default function VOPComplianceDashboard({ products }: VOPComplianceDashboardProps) {
  // Calculate compliance stats
  const stats = React.useMemo(() => {
    let compliant = 0;
    let needsReview = 0;
    let rejected = 0;
    let totalScore = 0;
    let scoredProducts = 0;

    products.forEach(product => {
      // Check compliance if not already checked
      const compliance = product.vopCompliance || VOPComplianceService.checkCompliance({
        name: product.name,
        description: product.description,
        ingredients: product.ingredients || [],
        certifications: product.certifications || [],
        tags: product.tags || [],
        category: product.category,
        allergens: product.allergens || []
      });

      const badge = VOPComplianceService.getComplianceBadge(compliance);
      
      if (badge.status === 'approved') compliant++;
      else if (badge.status === 'warning') needsReview++;
      else rejected++;

      if (compliance.score !== undefined) {
        totalScore += compliance.score;
        scoredProducts++;
      }
    });

    return {
      total: products.length,
      compliant,
      needsReview,
      rejected,
      averageScore: scoredProducts > 0 ? Math.round(totalScore / scoredProducts) : 0,
      complianceRate: products.length > 0 ? Math.round((compliant / products.length) * 100) : 0
    };
  }, [products]);

  const guidelines = VOPComplianceService.getGuidelines();
  
  // Check if vendor has clothing products
  const hasClothingProducts = products.some(p => 
    ['clothing', 'apparel', 'fashion'].some(cat => 
      p.category?.toLowerCase().includes(cat) || 
      p.tags?.some(tag => tag.toLowerCase().includes(cat))
    )
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
          VOP Dietary Compliance
        </h2>
        <div className="flex items-center gap-2">
          <i className="fas fa-leaf text-2xl" style={{ color: '#478c0b' }}></i>
          <span className="text-sm font-medium text-gray-600">Village of Peace Standards</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold" style={{ color: '#478c0b' }}>
            {stats.compliant}
          </div>
          <div className="text-sm text-gray-600 mt-1">Compliant</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold" style={{ color: '#f6af0d' }}>
            {stats.needsReview}
          </div>
          <div className="text-sm text-gray-600 mt-1">Needs Review</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold" style={{ color: '#c23c09' }}>
            {stats.rejected}
          </div>
          <div className="text-sm text-gray-600 mt-1">Non-Compliant</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold" style={{ color: '#4a5568' }}>
            {stats.averageScore}
          </div>
          <div className="text-sm text-gray-600 mt-1">Avg. Health Score</div>
        </div>
      </div>

      {/* Compliance Rate */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Compliance Rate</span>
          <span className="text-sm font-bold" style={{ color: '#478c0b' }}>
            {stats.complianceRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${stats.complianceRate}%`,
              backgroundColor: stats.complianceRate >= 80 ? '#478c0b' : 
                             stats.complianceRate >= 50 ? '#f6af0d' : '#c23c09'
            }}
          />
        </div>
      </div>

      {/* Guidelines Summary */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#3a3a1d' }}>
          VOP {hasClothingProducts ? 'Community' : 'Dietary'} Guidelines
        </h3>
        
        {/* Dietary Guidelines */}
        {!hasClothingProducts && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <i className="fas fa-check-circle text-green-600"></i>
                Key Principles
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {guidelines.dietary.principles.slice(0, 5).map((principle, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                <i className="fas fa-heart text-red-600"></i>
                Health Focus
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {guidelines.dietary.healthFocus.map((focus, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>{focus}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Clothing Guidelines */}
        {hasClothingProducts && (
          <div className="space-y-6">
            {/* Dietary Section */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <i className="fas fa-leaf text-green-600"></i>
                Food & Dietary Standards
              </h4>
              <div className="bg-green-50 rounded-lg p-4">
                <ul className="space-y-1 text-sm text-gray-600">
                  {guidelines.dietary.principles.slice(0, 3).map((principle, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Clothing Section */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <i className="fas fa-tshirt text-blue-600"></i>
                Clothing & Apparel Standards
              </h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <ul className="space-y-1 text-sm text-gray-600 mb-4">
                  {guidelines.clothing.principles.map((principle, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t border-blue-200 pt-3 mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Preferred Materials:</p>
                  <div className="flex flex-wrap gap-2">
                    {guidelines.clothing.preferredMaterials.map((material, index) => (
                      <span key={index} className="text-xs bg-white px-2 py-1 rounded-full text-blue-700 border border-blue-200">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Items */}
      {stats.needsReview > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
            <div>
              <p className="font-medium text-gray-800">
                {stats.needsReview} product{stats.needsReview > 1 ? 's need' : ' needs'} review
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Consider adding vegan certifications or reviewing ingredients to ensure full VOP compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {stats.complianceRate === 100 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-600 mt-1"></i>
            <div>
              <p className="font-medium text-gray-800">
                Excellent! All products are VOP compliant
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Your entire catalog meets Village of Peace dietary standards.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
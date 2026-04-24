'use client';

import React, { useState } from 'react';
import { Palette, Layout, Save, Eye, Copy, Settings, Plus } from 'lucide-react';
import { storeTemplates, customizationOptions, applyTemplateToVendor } from '@/lib/data/store-templates';
import Image from 'next/image';

export default function AdminTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(storeTemplates[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(selectedTemplate);

  const handleTemplateSelect = (template: typeof storeTemplates[0]) => {
    setSelectedTemplate(template);
    setEditingTemplate(template);
    setIsEditing(false);
  };

  const handleSaveTemplate = () => {
    // In real implementation, save to database
    console.log('Saving template:', editingTemplate);
    setSelectedTemplate(editingTemplate);
    setIsEditing(false);
  };

  const handleDuplicateTemplate = () => {
    const newTemplate = {
      ...selectedTemplate,
      id: `${selectedTemplate.id}-copy-${Date.now()}`,
      name: `${selectedTemplate.name} (Copy)`
    };
    // In real implementation, save to database
    console.log('Duplicating template:', newTemplate);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Store Templates</h1>
          <p className="text-gray-600">Manage and customize store templates for vendors</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Templates</h2>
                <button className="p-2 bg-leaf-green text-white rounded-lg hover:bg-green-700">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {storeTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate.id === template.id
                        ? 'border-leaf-green bg-leaf-green/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: template.colorScheme.primary }}
                      >
                        <Layout className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <div className="flex gap-2 mt-2">
                          {template.features.slice(0, 2).map((feature, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Template Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedTemplate.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDuplicateTemplate}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="px-4 py-2 bg-leaf-green text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Preview
                  </button>
                </div>
              </div>

              {/* Template Sections */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Template Sections</h3>
                <div className="space-y-3">
                  {editingTemplate.sections.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          {section.order}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{section.type} Section</p>
                          <p className="text-sm text-gray-600">
                            {section.enabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      {isEditing && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={section.enabled}
                            onChange={(e) => {
                              const updated = { ...editingTemplate };
                              const idx = updated.sections.findIndex(s => s.id === section.id);
                              updated.sections[idx].enabled = e.target.checked;
                              setEditingTemplate(updated);
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Show</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Scheme */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Color Scheme</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(editingTemplate.colorScheme).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm text-gray-600 capitalize">{key}</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-10 h-10 rounded border-2 border-gray-300"
                          style={{ backgroundColor: value }}
                        />
                        {isEditing ? (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const updated = { ...editingTemplate };
                              updated.colorScheme[key as keyof typeof updated.colorScheme] = e.target.value;
                              setEditingTemplate(updated);
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                          />
                        ) : (
                          <span className="text-sm font-mono">{value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Quick Presets:</p>
                    <div className="flex gap-2">
                      {customizationOptions.colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            const updated = { ...editingTemplate };
                            updated.colorScheme = {
                              ...updated.colorScheme,
                              ...preset.colors,
                              background: updated.colorScheme.background,
                              text: updated.colorScheme.text,
                              muted: updated.colorScheme.muted
                            };
                            setEditingTemplate(updated);
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Typography */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Typography</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Heading Font</label>
                    {isEditing ? (
                      <select
                        value={editingTemplate.typography.headingFont}
                        onChange={(e) => {
                          const updated = { ...editingTemplate };
                          updated.typography.headingFont = e.target.value;
                          setEditingTemplate(updated);
                        }}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      >
                        {customizationOptions.fonts.headings.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="mt-1 font-medium">{editingTemplate.typography.headingFont}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Body Font</label>
                    {isEditing ? (
                      <select
                        value={editingTemplate.typography.bodyFont}
                        onChange={(e) => {
                          const updated = { ...editingTemplate };
                          updated.typography.bodyFont = e.target.value;
                          setEditingTemplate(updated);
                        }}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      >
                        {customizationOptions.fonts.body.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="mt-1 font-medium">{editingTemplate.typography.bodyFont}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Layout Options */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Layout Options</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Product Grid</label>
                    {isEditing ? (
                      <select
                        value={editingTemplate.layout.productGrid}
                        onChange={(e) => {
                          const updated = { ...editingTemplate };
                          updated.layout.productGrid = e.target.value as any;
                          setEditingTemplate(updated);
                        }}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      >
                        <option value="grid">Grid</option>
                        <option value="list">List</option>
                        <option value="masonry">Masonry</option>
                      </select>
                    ) : (
                      <p className="mt-1 font-medium capitalize">{editingTemplate.layout.productGrid}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Spacing</label>
                    {isEditing ? (
                      <select
                        value={editingTemplate.layout.spacing}
                        onChange={(e) => {
                          const updated = { ...editingTemplate };
                          updated.layout.spacing = e.target.value as any;
                          setEditingTemplate(updated);
                        }}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="spacious">Spacious</option>
                      </select>
                    ) : (
                      <p className="mt-1 font-medium capitalize">{editingTemplate.layout.spacing}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    onClick={() => {
                      setEditingTemplate(selectedTemplate);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 bg-leaf-green text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Template Usage */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Template Usage</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Active Stores</span>
                  <span className="font-semibold">
                    {Math.floor(Math.random() * 10) + 1}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Last Modified</span>
                  <span className="font-semibold">2 days ago</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Created By</span>
                  <span className="font-semibold">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
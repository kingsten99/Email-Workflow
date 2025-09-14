import React, { useState, useEffect } from 'react';

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImageUrl?: string;
}

interface ExistingImage {
  src: string;
  name: string;
  size: number;
  type: string;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl
}) => {
  const [activeTab, setActiveTab] = useState<'existing' | 'upload'>('existing');
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>(currentImageUrl || '');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Helper function to convert relative URL to absolute for display
  const getDisplayUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `http://localhost:3001${url}`;
  };

  // Helper function to ensure we store relative URLs
  const getStorageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url; // Keep data URLs as is
    if (url.startsWith('http://localhost:3001')) {
      return url.replace('http://localhost:3001', '');
    }
    return url;
  };

  // Fetch existing images when modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'existing') {
      fetchExistingImages();
    }
  }, [isOpen, activeTab]);

  const fetchExistingImages = async () => {
    setLoading(true);
    try {
      // Try to fetch from backend API
      const response = await fetch('http://localhost:3001/api/images');
      if (response.ok) {
        const images = await response.json();
        setExistingImages(images);
      } else {
        // Fallback to empty array if endpoint doesn't exist yet
        setExistingImages([]);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setExistingImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload file
      uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        // Store relative URL for use in email templates
        const relativeUrl = result.data[0].src;
        setSelectedImage(relativeUrl);
        setActiveTab('upload'); // Stay on upload tab to show preview
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    // Store relative URL for template use
    const relativeUrl = getStorageUrl(imageUrl);
    setSelectedImage(relativeUrl);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onSelectImage(selectedImage);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedImage(getStorageUrl(currentImageUrl || ''));
    setUploadPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay image-selection-modal" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select Image</h3>
          <button className="close-button" onClick={handleCancel}>
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'existing' ? 'active' : ''}`}
            onClick={() => setActiveTab('existing')}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="tab-icon">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Existing Images
          </button>
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="tab-icon">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Upload New
          </button>
        </div>

        {/* Tab Content */}
        <div className="modal-body">
          {activeTab === 'existing' && (
            <div className="existing-images-tab">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading images...</p>
                </div>
              ) : existingImages.length > 0 ? (
                <div className="images-grid">
                  {existingImages.map((image, index) => (
                    <div
                      key={index}
                      className={`image-item ${getStorageUrl(selectedImage) === getStorageUrl(image.src) ? 'selected' : ''}`}
                      onClick={() => handleSelectImage(image.src)}
                    >
                      <img src={getDisplayUrl(image.src)} alt={image.name} />
                      <div className="image-info">
                        <span className="image-name">{image.name}</span>
                        <span className="image-size">{(image.size / 1024).toFixed(1)}KB</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="empty-icon">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p>No images found</p>
                  <p>Upload your first image using the "Upload New" tab</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="upload-tab">
              {!uploadPreview ? (
                <div className="upload-area">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    {uploading ? (
                      <>
                        <div className="spinner"></div>
                        <p>Uploading...</p>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="upload-icon">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <p>Click to upload image</p>
                        <p className="upload-hint">Supports PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className="upload-preview">
                  <div className="preview-image-container">
                    <img src={uploadPreview} alt="Upload preview" className="preview-image" />
                    <div className="preview-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setUploadPreview(null);
                          setSelectedImage(getStorageUrl(currentImageUrl || ''));
                        }}
                      >
                        Choose Different Image
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!selectedImage}
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSelectionModal;
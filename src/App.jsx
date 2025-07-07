import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, ThumbsUp, ThumbsDown, User, Star, Clock, Eye, Heart, MessageCircle } from 'lucide-react';

export default function ImageGalleryApp() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [imageTitle, setImageTitle] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const fileInputRef = useRef(null);

  // Cargar datos iniciales
  useEffect(() => {
    const savedUser = localStorage.getItem('imageGalleryUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedImages = localStorage.getItem('imageGalleryImages');
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    } else {
      // Datos de ejemplo
      const exampleImages = [
        {
          id: 1,
          title: 'Atardecer en la playa',
          description: 'Una hermosa puesta de sol',
          author: 'FotoLover',
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
          uploadDate: new Date('2024-01-15'),
          ratings: {
            good: 15,
            canImprove: 3
          },
          userRatings: {},
          views: 89,
          comments: []
        },
        {
          id: 2,
          title: 'Montañas nevadas',
          description: 'Paisaje invernal espectacular',
          author: 'NatureFan',
          imageUrl: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=500&h=300&fit=crop',
          uploadDate: new Date('2024-01-10'),
          ratings: {
            good: 22,
            canImprove: 1
          },
          userRatings: {},
          views: 156,
          comments: []
        }
      ];
      setImages(exampleImages);
      localStorage.setItem('imageGalleryImages', JSON.stringify(exampleImages));
    }
  }, []);

  // Guardar imágenes en localStorage
  const saveImages = (updatedImages) => {
    setImages(updatedImages);
    localStorage.setItem('imageGalleryImages', JSON.stringify(updatedImages));
  };

  // Configurar usuario
  const handleSetUser = (nickname) => {
    const userData = {
      nickname,
      joinDate: new Date(),
      uploadsCount: 0
    };
    setUser(userData);
    localStorage.setItem('imageGalleryUser', JSON.stringify(userData));
  };

  // Manejar subida de archivos
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImage({
          file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // Publicar imagen
  const handlePublishImage = () => {
    if (!newImage || !imageTitle.trim()) return;

    const newImageData = {
      id: Date.now(),
      title: imageTitle.trim(),
      description: imageDescription.trim(),
      author: user.nickname,
      imageUrl: newImage.preview,
      uploadDate: new Date(),
      ratings: {
        good: 0,
        canImprove: 0
      },
      userRatings: {},
      views: 0,
      comments: []
    };

    const updatedImages = [newImageData, ...images];
    saveImages(updatedImages);

    // Actualizar contador de uploads del usuario
    const updatedUser = { ...user, uploadsCount: user.uploadsCount + 1 };
    setUser(updatedUser);
    localStorage.setItem('imageGalleryUser', JSON.stringify(updatedUser));

    // Limpiar formulario
    setNewImage(null);
    setImageTitle('');
    setImageDescription('');
    setShowUpload(false);
  };

  // Calificar imagen
  const handleRateImage = (imageId, rating) => {
    const updatedImages = images.map(img => {
      if (img.id === imageId) {
        const userKey = user ? user.nickname : 'anonymous';
        const currentRating = img.userRatings[userKey];
        
        // Si ya calificó, remover la calificación anterior
        if (currentRating) {
          img.ratings[currentRating]--;
        }
        
        // Agregar nueva calificación
        img.ratings[rating]++;
        img.userRatings[userKey] = rating;
      }
      return img;
    });
    
    saveImages(updatedImages);
  };

  // Incrementar vistas
  const handleViewImage = (imageId) => {
    const updatedImages = images.map(img => {
      if (img.id === imageId) {
        img.views++;
      }
      return img;
    });
    saveImages(updatedImages);
  };

  // Filtrar y ordenar imágenes
  const getFilteredAndSortedImages = () => {
    let filtered = [...images];

    // Filtrar
    if (filter === 'my-images' && user) {
      filtered = filtered.filter(img => img.author === user.nickname);
    } else if (filter === 'top-rated') {
      filtered = filtered.filter(img => img.ratings.good > img.ratings.canImprove);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'oldest':
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        case 'most-liked':
          return b.ratings.good - a.ratings.good;
        case 'most-viewed':
          return b.views - a.views;
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Componente de login
  const LoginForm = () => {
    const [nickname, setNickname] = useState('');

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📸</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Galería Social
            </h1>
            <p className="text-gray-600">
              Comparte tus mejores fotos y descubre increíbles imágenes
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Elige tu sobrenombre
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && nickname.trim() && handleSetUser(nickname)}
                placeholder="Ej: FotoMaster, ArteLover..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => nickname.trim() && handleSetUser(nickname)}
              disabled={!nickname.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Entrar a la Galería
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>✨ No necesitas registro</p>
            <p>📷 Sube y califica imágenes</p>
            <p>🎨 Descubre arte increíble</p>
          </div>
        </div>
      </div>
    );
  };

  // Componente de subida de imagen
  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Subir Nueva Imagen</h2>
          <button
            onClick={() => {
              setShowUpload(false);
              setNewImage(null);
              setImageTitle('');
              setImageDescription('');
            }}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Área de subida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona tu imagen
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {newImage ? (
                <div className="space-y-4">
                  <img
                    src={newImage.preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-lg"
                  />
                  <button
                    onClick={() => setNewImage(null)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-600">
                      Arrastra tu imagen aquí
                    </p>
                    <p className="text-sm text-gray-500">
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Elegir Archivo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Información de la imagen */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                placeholder="Dale un título atractivo a tu imagen..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="Cuéntanos sobre tu imagen..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowUpload(false);
                setNewImage(null);
                setImageTitle('');
                setImageDescription('');
              }}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePublishImage}
              disabled={!newImage || !imageTitle.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Publicar Imagen
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de tarjeta de imagen
  const ImageCard = ({ image }) => {
    const userRating = user ? image.userRatings[user.nickname] : null;
    const totalRatings = image.ratings.good + image.ratings.canImprove;
    const positivePercentage = totalRatings > 0 ? (image.ratings.good / totalRatings) * 100 : 0;

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div className="relative">
          <img
            src={image.imageUrl}
            alt={image.title}
            className="w-full h-64 object-cover cursor-pointer"
            onClick={() => handleViewImage(image.id)}
          />
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
            <Eye size={14} />
            {image.views}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{image.title}</h3>
              {image.description && (
                <p className="text-gray-600 text-sm mb-3">{image.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User size={16} />
                <span>{image.author}</span>
                <Clock size={16} className="ml-2" />
                <span>{new Date(image.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Estadísticas de calificación */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Calificación</span>
              <span className="text-sm text-gray-500">{totalRatings} votos</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${positivePercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>👍 {image.ratings.good}</span>
              <span>👎 {image.ratings.canImprove}</span>
            </div>
          </div>

          {/* Botones de calificación */}
          <div className="flex gap-2">
            <button
              onClick={() => handleRateImage(image.id, 'good')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                userRating === 'good'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
              }`}
            >
              <ThumbsUp size={16} />
              Buena
            </button>
            <button
              onClick={() => handleRateImage(image.id, 'canImprove')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                userRating === 'canImprove'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
              }`}
            >
              <ThumbsDown size={16} />
              Puede mejorar
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return <LoginForm />;
  }

  const filteredImages = getFilteredAndSortedImages();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="text-2xl">📸</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Galería Social</h1>
                <p className="text-xs text-gray-500">¡Hola, {user.nickname}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Has subido {user.uploadsCount} imágenes
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
              >
                <Camera size={16} />
                Subir Imagen
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros y controles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('my-images')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'my-images'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Mis Imágenes
            </button>
            <button
              onClick={() => setFilter('top-rated')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'top-rated'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Mejor Calificadas
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="newest">Más Recientes</option>
              <option value="oldest">Más Antiguas</option>
              <option value="most-liked">Más Gustadas</option>
              <option value="most-viewed">Más Vistas</option>
            </select>
          </div>
        </div>

        {/* Galería de imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                {filter === 'my-images' ? 'Aún no has subido imágenes' : 'No hay imágenes para mostrar'}
              </h3>
              <p className="text-gray-500">
                {filter === 'my-images' 
                  ? '¡Sube tu primera imagen y compártela con la comunidad!' 
                  : 'Sé el primero en compartir una imagen increíble'}
              </p>
            </div>
          ) : (
            filteredImages.map(image => (
              <ImageCard key={image.id} image={image} />
            ))
          )}
        </div>
      </div>

      {/* Modal de subida */}
      {showUpload && <UploadModal />}
    </div>
  );
}
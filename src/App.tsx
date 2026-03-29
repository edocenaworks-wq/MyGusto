import React, { useState, useEffect } from 'react';
import { db, type Recipe } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Plus, 
  Search, 
  Clock, 
  ChefHat, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  Camera,
  X,
  Check,
  RotateCcw,
  Download,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { App as CapacitorApp } from '@capacitor/app';
import logo from '../assets/logo.png';
import packageJson from '../package.json';

// --- Configuration ---
const GITHUB_OWNER = 'edocenaworks-wq';
const GITHUB_REPO = 'MyGusto';
const CURRENT_VERSION = packageJson.version;

// --- Components ---

const UpdatePopup = ({ latestVersion, releaseUrl, onIgnore }: {
  latestVersion: string;
  releaseUrl: string;
  onIgnore: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 100 }}
    className="fixed bottom-24 left-6 right-6 bg-stone-900 text-white p-6 rounded-[32px] shadow-2xl z-[60] border border-white/10"
  >
    <div className="flex items-start gap-4">
      <div className="bg-orange-500 p-3 rounded-2xl">
        <Download size={24} className="text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg">Aggiornamento Disponibile!</h3>
        <p className="text-stone-400 text-sm mt-1">
          È disponibile la versione <b>{latestVersion}</b>. Tu hai la {CURRENT_VERSION}.
        </p>
        <div className="flex gap-3 mt-4">
          <a
            href={releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-stone-900 px-5 py-2.5 rounded-full font-bold text-sm flex-1 text-center"
          >
            Scarica Ora
          </a>
          <button
            onClick={onIgnore}
            className="bg-stone-800 text-stone-400 px-5 py-2.5 rounded-full font-bold text-sm"
          >
            Più tardi
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const RecipeCard = ({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-sm border border-stone-100 dark:border-stone-800 cursor-pointer flex gap-4 transition-colors"
  >
    <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
      {recipe.image ? (
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
      ) : (
        <ChefHat className="text-stone-300 dark:text-stone-600 w-8 h-8" />
      )}
    </div>
    <div className="flex flex-col justify-center flex-1">
      <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-lg leading-tight">{recipe.title}</h3>
      <div className="flex items-center gap-3 mt-2 text-stone-500 dark:text-stone-400 text-sm">
        <span className="flex items-center gap-1">
          <Clock size={14} /> {recipe.prepTime + recipe.cookTime} min
        </span>
        <span className="flex items-center gap-1">
          <ChefHat size={14} /> {recipe.ingredients.length} ingr.
        </span>
      </div>
    </div>
  </motion.div>
);

const RecipeForm = ({ 
  initialData, 
  onSave, 
  onCancel 
}: { 
  initialData?: Recipe; 
  onSave: (data: Partial<Recipe>) => void; 
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [ingredients, setIngredients] = useState(initialData?.ingredients.join('\n') || '');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [cookingInfo, setCookingInfo] = useState(initialData?.cookingInfo || '');
  const [prepTime, setPrepTime] = useState(initialData?.prepTime || 15);
  const [cookTime, setCookTime] = useState(initialData?.cookTime || 20);
  const [image, setImage] = useState(initialData?.image || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-50 dark:bg-stone-950 z-50 overflow-y-auto p-4 pb-24 transition-colors">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onCancel} className="p-2 -ml-2 text-stone-600 dark:text-stone-400">
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">
            {initialData ? 'Modifica Ricetta' : 'Nuova Ricetta'}
          </h2>
          <button 
            onClick={() => onSave({ 
              title, 
              ingredients: ingredients.split('\n').filter(i => i.trim()), 
              instructions, 
              cookingInfo,
              prepTime, 
              cookTime, 
              image 
            })}
            disabled={!title}
            className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold disabled:opacity-50"
          >
            Salva
          </button>
        </div>

        <div className="space-y-6">
          <div 
            className="w-full aspect-video bg-stone-200 dark:bg-stone-800 rounded-3xl overflow-hidden relative group cursor-pointer"
            onClick={() => document.getElementById('img-input')?.click()}
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-stone-600">
                <Camera size={48} strokeWidth={1.5} />
                <p className="mt-2 font-medium">Aggiungi Foto</p>
              </div>
            )}
            <input id="img-input" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Titolo</label>
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="Es: Pasta alla Carbonara"
                className="w-full bg-white dark:bg-stone-900 border-none rounded-2xl p-4 text-lg font-semibold focus:ring-2 focus:ring-orange-500 text-stone-800 dark:text-stone-100 transition-colors placeholder:text-stone-300 dark:placeholder:text-stone-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Prep. (min)</label>
                <input 
                  type="number"
                  value={prepTime} 
                  onChange={e => setPrepTime(Number(e.target.value))}
                  className="w-full bg-white dark:bg-stone-900 border-none rounded-2xl p-4 font-semibold focus:ring-2 focus:ring-orange-500 text-stone-800 dark:text-stone-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Cottura (min)</label>
                <input 
                  type="number"
                  value={cookTime} 
                  onChange={e => setCookTime(Number(e.target.value))}
                  className="w-full bg-white dark:bg-stone-900 border-none rounded-2xl p-4 font-semibold focus:ring-2 focus:ring-orange-500 text-stone-800 dark:text-stone-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Ingredienti (uno per riga)</label>
              <textarea 
                value={ingredients} 
                onChange={e => setIngredients(e.target.value)}
                rows={5}
                placeholder="300g Pasta..."
                className="w-full bg-white dark:bg-stone-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 text-stone-800 dark:text-stone-100 transition-colors placeholder:text-stone-300 dark:placeholder:text-stone-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Procedimento</label>
              <textarea 
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={8}
                placeholder="Inizia bollendo l'acqua..."
                className="w-full bg-white dark:bg-stone-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 text-stone-800 dark:text-stone-100 transition-colors placeholder:text-stone-300 dark:placeholder:text-stone-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Informazioni di Cottura</label>
              <textarea 
                value={cookingInfo}
                onChange={e => setCookingInfo(e.target.value)}
                rows={3}
                placeholder="Es: Forno ventilato 180°C, ripiano centrale..."
                className="w-full bg-white dark:bg-stone-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-orange-500 text-stone-800 dark:text-stone-100 transition-colors placeholder:text-stone-300 dark:placeholder:text-stone-700"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecipeDetail = ({ 
  recipe, 
  onBack, 
  onEdit, 
  onDelete 
}: { 
  recipe: Recipe; 
  onBack: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set(recipe.checkedIngredients || []));

  useEffect(() => {
    setCheckedIngredients(new Set(recipe.checkedIngredients || []));
  }, [recipe.checkedIngredients]);

  const toggleIngredient = async (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);

    if (recipe.id) {
      await db.recipes.update(recipe.id, {
        checkedIngredients: Array.from(newChecked)
      });
    }
  };

  const resetIngredients = async () => {
    setCheckedIngredients(new Set());
    if (recipe.id) {
      await db.recipes.update(recipe.id, {
        checkedIngredients: []
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-50 dark:bg-stone-950 z-40 overflow-y-auto pb-24 transition-colors">
      <div className="relative h-72">
        {recipe.image ? (
          <img src={recipe.image} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-600">
            <ChefHat size={64} />
          </div>
        )}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button onClick={onBack} className="bg-white/80 dark:bg-stone-900/80 backdrop-blur p-2 rounded-full text-stone-800 dark:text-stone-100">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button onClick={onEdit} className="bg-white/80 dark:bg-stone-900/80 backdrop-blur p-2 rounded-full text-stone-800 dark:text-stone-100">
              <Edit3 size={20} />
            </button>
            <button onClick={onDelete} className="bg-white/80 dark:bg-stone-900/80 backdrop-blur p-2 rounded-full text-red-500">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 relative bg-stone-50 dark:bg-stone-950 rounded-t-[40px] pt-8 transition-colors">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 leading-tight">{recipe.title}</h1>
        
        <div className="flex gap-6 mt-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Prep</span>
            <span className="text-stone-800 dark:text-stone-200 font-semibold">{recipe.prepTime} min</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Cottura</span>
            <span className="text-stone-800 dark:text-stone-200 font-semibold">{recipe.cookTime} min</span>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Ingredienti</h2>
            {checkedIngredients.size > 0 && (
              <button 
                onClick={resetIngredients}
                className="flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
              >
                <RotateCcw size={14} />
                Reset Lista
              </button>
            )}
          </div>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, i) => (
              <li 
                key={i} 
                onClick={() => toggleIngredient(i)}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all cursor-pointer ${
                  checkedIngredients.has(i) 
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-stone-400 dark:text-stone-600 line-through'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-sm'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  checkedIngredients.has(i) 
                    ? 'bg-orange-500 border-orange-500' 
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800'
                }`}>
                  {checkedIngredients.has(i) && <Check size={16} className="text-white" />}
                </div>
                <span className="font-medium">{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">Procedimento</h2>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
            {recipe.instructions}
          </p>
        </div>

        {recipe.cookingInfo && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">Informazioni di Cottura</h2>
            <div className="bg-orange-50 dark:bg-orange-500/10 p-6 rounded-3xl text-stone-700 dark:text-stone-300 leading-relaxed border border-orange-100 dark:border-orange-500/20 italic transition-colors">
              {recipe.cookingInfo}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const recipes = useLiveQuery(() => db.recipes.orderBy('createdAt').reverse().toArray());
  const [search, setSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Update state
  const [updateAvailable, setUpdateAvailable] = useState<{ version: string; url: string } | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleBackButton = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (isFormOpen) {
        setIsFormOpen(false);
        setEditingRecipe(null);
      } else if (selectedRecipe) {
        setSelectedRecipe(null);
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      handleBackButton.then(h => h.remove());
    };
  }, [isFormOpen, selectedRecipe]);

  // Check for updates
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`);
        const data = await response.json();

        if (data.tag_name) {
          const latest = data.tag_name.replace('v', '');
          const current = CURRENT_VERSION;

          if (latest !== current && latest !== '0.0.0') {
            setUpdateAvailable({
              version: latest,
              url: data.html_url
            });
          }
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    checkUpdates();
  }, []);

  const filteredRecipes = recipes?.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: Partial<Recipe>) => {
    const now = Date.now();
    if (editingRecipe?.id) {
      await db.recipes.update(editingRecipe.id, { ...data, updatedAt: now });
    } else {
      await db.recipes.add({
        ...data as Recipe,
        createdAt: now,
        updatedAt: now,
        checkedIngredients: []
      });
    }
    setIsFormOpen(false);
    setEditingRecipe(null);
    if (selectedRecipe) {
      const updated = await db.recipes.get(selectedRecipe.id!);
      if (updated) setSelectedRecipe(updated);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questa ricetta?')) {
      await db.recipes.delete(id);
      setSelectedRecipe(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 transition-colors">
      <header className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">MyGusto</h1>
            <p className="text-stone-400 dark:text-stone-500 text-sm font-medium">Il tuo ricettario personale</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-orange-50 dark:border-stone-800 text-orange-500 active:scale-95 transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-orange-100 dark:border-stone-800">
              <img src={logo} alt="MyGusto Logo" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-600" size={20} />
          <input 
            type="text"
            placeholder="Cerca una ricetta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-stone-900 border-none rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-orange-500 text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-700 transition-colors"
          />
        </div>
      </header>

      <main className="p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredRecipes?.map((recipe, index) => (
            <RecipeCard 
              key={recipe.id || `recipe-${index}-${recipe.createdAt}`} 
              recipe={recipe} 
              onClick={() => setSelectedRecipe(recipe)} 
            />
          ))}
        </AnimatePresence>

        {filteredRecipes?.length === 0 && (
          <div className="text-center py-20">
            <ChefHat className="mx-auto text-stone-200 dark:text-stone-800 mb-4" size={64} />
            <p className="text-stone-400 dark:text-stone-600 font-medium">Nessuna ricetta trovata.</p>
          </div>
        )}
      </main>

      <button 
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-8 right-8 bg-orange-500 text-white p-5 rounded-3xl shadow-xl shadow-orange-200 dark:shadow-orange-900/20 active:scale-95 transition-transform z-30"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      <AnimatePresence>
        {updateAvailable && (
          <UpdatePopup
            latestVersion={updateAvailable.version}
            releaseUrl={updateAvailable.url}
            onIgnore={() => setUpdateAvailable(null)}
          />
        )}

        {selectedRecipe && (
          <RecipeDetail 
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
            onEdit={() => {
              setEditingRecipe(selectedRecipe);
              setIsFormOpen(true);
            }}
            onDelete={() => handleDelete(selectedRecipe.id!)}
          />
        )}

        {isFormOpen && (
          <RecipeForm 
            initialData={editingRecipe || undefined}
            onSave={handleSave}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingRecipe(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

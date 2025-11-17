'use client';

import { useState, useActionState, useEffect, startTransition, useRef } from 'react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit2, Trash2, MoreVertical, X } from 'lucide-react';
import { addWord, updateWord, deleteWord } from '@/app/(login)/actions';
import useSWR from 'swr';
import { mutate } from 'swr';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type DictionaryWord = {
  id: number;
  word: string;
  createdAt: string;
  updatedAt: string;
};

type ActionState = {
  word?: string;
  error?: string;
  success?: string;
};

function AddWordForm({
  state,
  formAction,
  isPending,
  onCancel,
  isVisible,
  formKey,
}: {
  state: ActionState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  onCancel: () => void;
  isVisible: boolean;
  formKey: number;
}) {
  const prevPendingRef = React.useRef<boolean>(false);
  const hasProcessedSuccessRef = React.useRef<boolean>(false);
  
  // Reset tracking when form key changes (new form instance)
  React.useEffect(() => {
    hasProcessedSuccessRef.current = false;
    prevPendingRef.current = isPending;
  }, [formKey]);
  
  useEffect(() => {
    // Only process success if form was just submitted (pending changed from true to false)
    const justSubmitted = prevPendingRef.current && !isPending && state.success;
    if (justSubmitted && !hasProcessedSuccessRef.current && isVisible) {
      hasProcessedSuccessRef.current = true;
      mutate('/api/dictionary');
      onCancel();
    }
    prevPendingRef.current = isPending;
  }, [state.success, isPending, isVisible, onCancel]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add New Word</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={formAction}>
          <div>
            <Label htmlFor="word" className="mb-2">
              Word
            </Label>
            <Input
              id="word"
              name="word"
              placeholder="Enter a word"
              defaultValue={state.word}
              required
              maxLength={100}
              autoFocus
            />
          </div>
          {state.error && (
            <p className="text-red-500 text-sm">{state.error}</p>
          )}
          {state.success && (
            <p className="text-green-500 text-sm">{state.success}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Word'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function EditWordForm({
  word,
  state,
  formAction,
  isPending,
  onCancel,
}: {
  word: DictionaryWord;
  state: ActionState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (state.success) {
      mutate('/api/dictionary');
      onCancel();
    }
  }, [state.success, onCancel]);

  return (
    <form className="flex items-center gap-2" action={formAction}>
      <Input
        name="word"
        defaultValue={word.word}
        required
        maxLength={100}
        className="flex-1"
        autoFocus
      />
      <input type="hidden" name="id" value={word.id} />
      <Button
        type="submit"
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Save'
        )}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onCancel}
        disabled={isPending}
      >
        <X className="h-4 w-4" />
      </Button>
    </form>
  );
}

export default function DictionaryPage() {
  const { data: words = [], isLoading } = useSWR<DictionaryWord[]>(
    '/api/dictionary',
    fetcher
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [addState, addAction, isAddPending] = useActionState<ActionState, FormData>(
    addWord,
    {}
  );

  const [updateState, updateAction, isUpdatePending] = useActionState<
    ActionState,
    FormData
  >(updateWord, {});

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    ActionState,
    FormData
  >(deleteWord, {});

  useEffect(() => {
    if (deleteState.success) {
      mutate('/api/dictionary');
    } else if (deleteState.error) {
      alert(deleteState.error);
    }
  }, [deleteState]);

  // Reset form key when opening the form to create a fresh instance
  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setFormKey((prev) => prev + 1);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this word?')) {
      return;
    }
    const formData = new FormData();
    formData.append('id', id.toString());
    startTransition(() => {
      deleteAction(formData);
    });
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900">
          Dictionary
        </h1>
        {!showAddForm && (
          <Button
            onClick={handleOpenAddForm}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Word
          </Button>
        )}
      </div>

      {showAddForm && (
        <AddWordForm
          key={formKey}
          formKey={formKey}
          state={addState}
          formAction={addAction}
          isPending={isAddPending}
          isVisible={showAddForm}
          onCancel={() => {
            setShowAddForm(false);
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Words</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : words.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <p className="text-muted-foreground mb-4">
                No words yet. Add your first word to get started!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Word
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Added
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((word) => (
                    <tr key={word.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {editingId === word.id ? (
                          <EditWordForm
                            word={word}
                            state={updateState}
                            formAction={updateAction}
                            isPending={isUpdatePending}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <span className="font-medium">{word.word}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(word.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end">
                          {editingId !== word.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setEditingId(word.id)}
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(word.id)}
                                  variant="destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

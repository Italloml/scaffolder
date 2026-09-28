import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { PageHeader } from '../components/ui/page-header';
import { ActionFeedback, EmptyState, ErrorState, LoadingState } from '../components/ui/state-feedback';
import { customFetch } from '../lib/api-client/custom-fetch';

type Category = { id: string; title: string; description: string | null; color: string; _count?: { tasks: number } };
const list = () => customFetch<{ data: Category[] }>('/categories');

export function CategoriesPage() {
  const client = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [feedback, setFeedback] = useState<{type:'success'|'error';message:string}|null>(null);
  const query = useQuery({ queryKey: ['categories'], queryFn: list });
  const save = useMutation({ mutationFn: (form: { id?: string; title: string; description?: string; color: string }) => customFetch(`/categories${form.id ? `/${form.id}` : ''}`, { method: form.id ? 'PUT' : 'POST', body: JSON.stringify(form) }), onSuccess: () => { setEditing(null); setTitle(''); setDescription(''); setFeedback({type:'success',message:'Categoria salva.'}); client.invalidateQueries({queryKey:['categories']}); }, onError: () => setFeedback({type:'error',message:'Não foi possível salvar. Verifique se o título já está em uso.'}) });
  const remove = useMutation({ mutationFn: (id: string) => customFetch(`/categories/${id}`, { method: 'DELETE' }), onSuccess: () => { setFeedback({type:'success',message:'Categoria removida.'}); client.invalidateQueries({queryKey:['categories']}); }, onError: () => setFeedback({type:'error',message:'Não foi possível remover a categoria.'}) });
  const beginEdit = (category: Category) => { setEditing(category); setTitle(category.title); setDescription(category.description || ''); setColor(category.color); };
  return <div className="space-y-6">
    <PageHeader title="Categorias" category="Administração" subtitle="Organize as tarefas em categorias." badgeText="Admin" />
    {feedback && <ActionFeedback type={feedback.type} message={feedback.message} onDismiss={() => setFeedback(null)} />}
    <Card><CardContent className="p-5">
      <h2 className="mb-4 font-semibold">{editing ? 'Editar categoria' : 'Nova categoria'}</h2>
      <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]" onSubmit={e => {e.preventDefault(); save.mutate({ ...(editing ? {id:editing.id} : {}), title, description, color });}}>
        <input required maxLength={100} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título" className="h-10 rounded-md border border-slate-300 bg-transparent px-3 text-sm dark:border-slate-700" />
        <input maxLength={500} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Descrição (opcional)" className="h-10 rounded-md border border-slate-300 bg-transparent px-3 text-sm dark:border-slate-700" />
        <input aria-label="Cor da categoria" type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-10 w-14 rounded border border-slate-300 p-1 dark:border-slate-700" />
        <div className="flex gap-2"><Button type="submit" isLoading={save.isPending}><Plus className="mr-2 h-4 w-4"/>{editing ? 'Salvar' : 'Adicionar'}</Button>{editing && <Button type="button" variant="outline" onClick={()=>{setEditing(null);setTitle('');setDescription('');}}>Cancelar</Button>}</div>
      </form>
    </CardContent></Card>
    {query.isLoading ? <LoadingState /> : query.isError ? <ErrorState title="Falha ao carregar categorias" onRetry={()=>query.refetch()} /> : (query.data?.data?.length ?? 0) === 0 ? <EmptyState title="Nenhuma categoria" description="Crie a primeira categoria para organizar tarefas." /> :
      <div className="grid gap-3">{query.data?.data.map(category=><Card key={category.id}><CardContent className="flex items-center justify-between gap-4 p-4"><div className="flex min-w-0 items-center gap-3"><span className="h-4 w-4 shrink-0 rounded-full" style={{backgroundColor:category.color}}/><div className="min-w-0"><div className="font-medium">{category.title}</div>{category.description && <p className="truncate text-sm text-slate-500">{category.description}</p>}<p className="text-xs text-slate-400">ID: {category.id} · {category._count?.tasks ?? 0} tarefas</p></div></div><div className="flex gap-2"><Button size="icon" variant="outline" aria-label={`Editar ${category.title}`} onClick={()=>beginEdit(category)}><Edit2 className="h-4 w-4"/></Button><Button size="icon" variant="destructive" aria-label={`Remover ${category.title}`} onClick={()=>remove.mutate(category.id)}><Trash2 className="h-4 w-4"/></Button></div></CardContent></Card>)}</div>}
  </div>;
}

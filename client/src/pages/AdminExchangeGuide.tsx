import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ArrowLeft, Shield, Database } from "lucide-react";
import { Link } from "wouter";

const EXCHANGES = ["gate", "okx", "binance", "bybit", "bitget"];
const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "入门" },
  { value: "intermediate", label: "进阶" },
  { value: "advanced", label: "高级" },
];
const KYC_OPTIONS = [
  { value: "none", label: "无需 KYC" },
  { value: "basic", label: "基础 KYC" },
  { value: "standard", label: "标准 KYC" },
  { value: "full", label: "完整 KYC" },
];
const FEE_OPTIONS = [
  { value: "低", label: "低" },
  { value: "中", label: "中" },
  { value: "高", label: "高" },
  { value: "N/A", label: "N/A" },
];

// ─── Category Form ───────────────────────────────────────────────────────────

type CategoryFormData = {
  slug: string;
  nameZh: string;
  nameEn: string;
  icon: string;
  descZh: string;
  descEn: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  sortOrder: number;
};

const emptyCategoryForm = (): CategoryFormData => ({
  slug: "", nameZh: "", nameEn: "", icon: "📦",
  descZh: "", descEn: "", difficulty: "beginner", sortOrder: 0,
});

function CategoryDialog({
  open, onClose, initial, isEdit
}: {
  open: boolean;
  onClose: () => void;
  initial: CategoryFormData;
  isEdit: boolean;
}) {
  const [form, setForm] = useState<CategoryFormData>(initial);
  const utils = trpc.useUtils();

  const create = trpc.adminExchangeGuide.createCategory.useMutation({
    onSuccess: () => { toast.success("分类已创建"); utils.exchangeGuide.categories.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.adminExchangeGuide.updateCategory.useMutation({
    onSuccess: () => { toast.success("分类已更新"); utils.exchangeGuide.categories.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!form.slug || !form.nameZh || !form.nameEn || !form.icon || !form.descZh || !form.descEn) {
      toast.error("请填写所有必填字段");
      return;
    }
    if (isEdit) {
      update.mutate({ slug: form.slug, nameZh: form.nameZh, nameEn: form.nameEn, icon: form.icon, descZh: form.descZh, descEn: form.descEn, difficulty: form.difficulty, sortOrder: form.sortOrder });
    } else {
      create.mutate(form);
    }
  };

  const f = (field: keyof CategoryFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑功能分类" : "新增功能分类"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Slug（唯一标识）</label>
              <Input value={form.slug} onChange={f("slug")} disabled={isEdit} placeholder="spot" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">图标 Emoji</label>
              <Input value={form.icon} onChange={f("icon")} placeholder="💱" className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">中文名称</label>
              <Input value={form.nameZh} onChange={f("nameZh")} placeholder="现货交易" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">英文名称</label>
              <Input value={form.nameEn} onChange={f("nameEn")} placeholder="Spot Trading" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">中文描述</label>
            <Textarea value={form.descZh} onChange={f("descZh")} placeholder="功能描述（中文）" className="mt-1" rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium">英文描述</label>
            <Textarea value={form.descEn} onChange={f("descEn")} placeholder="Feature description (English)" className="mt-1" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">难度</label>
              <Select value={form.difficulty} onValueChange={(v) => setForm(p => ({ ...p, difficulty: v as "beginner" | "intermediate" | "advanced" }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">排序（越小越前）</label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))} className="mt-1" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={create.isPending || update.isPending}>
            {create.isPending || update.isPending ? "保存中…" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Support Form ────────────────────────────────────────────────────────────

type SupportFormData = {
  exchangeSlug: string;
  featureSlug: string;
  supported: number;
  levelZh: string;
  levelEn: string;
  detailZh: string;
  detailEn: string;
  maxLeverage: string;
  feeInfo: string;
  highlight: number;
  kycLevel: string;
  supportedRegions: string;
  feeLevel: string;
  notes: string;
};

const emptySupportForm = (featureSlug = "", exchangeSlug = ""): SupportFormData => ({
  exchangeSlug, featureSlug, supported: 1, levelZh: "", levelEn: "",
  detailZh: "", detailEn: "", maxLeverage: "", feeInfo: "",
  highlight: 0, kycLevel: "standard", supportedRegions: "全球", feeLevel: "低", notes: "",
});

function SupportDialog({
  open, onClose, initial, categories
}: {
  open: boolean;
  onClose: () => void;
  initial: SupportFormData;
  categories: { slug: string; nameZh: string; icon: string }[];
}) {
  const [form, setForm] = useState<SupportFormData>(initial);
  const utils = trpc.useUtils();

  const upsert = trpc.adminExchangeGuide.upsertSupport.useMutation({
    onSuccess: () => {
      toast.success("数据已保存");
      utils.adminExchangeGuide.allSupport.invalidate();
      utils.exchangeGuide.featureSupport.invalidate();
      utils.exchangeGuide.exchangeFeatures.invalidate();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const f = (field: keyof SupportFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑交易所功能支持数据</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">交易所</label>
              <Select value={form.exchangeSlug} onValueChange={(v) => setForm(p => ({ ...p, exchangeSlug: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="选择交易所" /></SelectTrigger>
                <SelectContent>
                  {EXCHANGES.map(e => <SelectItem key={e} value={e}>{e.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">功能分类</label>
              <Select value={form.featureSlug} onValueChange={(v) => setForm(p => ({ ...p, featureSlug: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="选择功能" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.icon} {c.nameZh}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">是否支持</label>
              <Select value={String(form.supported)} onValueChange={(v) => setForm(p => ({ ...p, supported: Number(v) }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">✅ 支持</SelectItem>
                  <SelectItem value="0">❌ 不支持</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">是否高亮推荐</label>
              <Select value={String(form.highlight)} onValueChange={(v) => setForm(p => ({ ...p, highlight: Number(v) }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">⭐ 高亮</SelectItem>
                  <SelectItem value="0">普通</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">手续费等级</label>
              <Select value={form.feeLevel} onValueChange={(v) => setForm(p => ({ ...p, feeLevel: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FEE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">支持等级（中文）</label>
              <Input value={form.levelZh} onChange={f("levelZh")} placeholder="行业最强 ⭐" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">支持等级（英文）</label>
              <Input value={form.levelEn} onChange={f("levelEn")} placeholder="Industry Best ⭐" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">详细说明（中文）</label>
            <Textarea value={form.detailZh} onChange={f("detailZh")} placeholder="功能详细说明…" className="mt-1" rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium">详细说明（英文）</label>
            <Textarea value={form.detailEn} onChange={f("detailEn")} placeholder="Feature detail in English…" className="mt-1" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">KYC 要求</label>
              <Select value={form.kycLevel} onValueChange={(v) => setForm(p => ({ ...p, kycLevel: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KYC_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">支持地区</label>
              <Input value={form.supportedRegions} onChange={f("supportedRegions")} placeholder="全球（除美国）" className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">最大杠杆（可选）</label>
              <Input value={form.maxLeverage} onChange={f("maxLeverage")} placeholder="100x" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">手续费信息（可选）</label>
              <Input value={form.feeInfo} onChange={f("feeInfo")} placeholder="Maker 0.02% / Taker 0.05%" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">备注（仅管理员可见）</label>
            <Textarea value={form.notes} onChange={f("notes")} placeholder="内部备注…" className="mt-1" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={() => upsert.mutate({
            ...form,
            supported: form.supported as 0 | 1,
            highlight: form.highlight as 0 | 1,
            kycLevel: form.kycLevel as "none" | "basic" | "standard" | "full",
            maxLeverage: form.maxLeverage || undefined,
            feeInfo: form.feeInfo || undefined,
            supportedRegions: form.supportedRegions || undefined,
            feeLevel: form.feeLevel || undefined,
            notes: form.notes || undefined,
          })} disabled={upsert.isPending}>
            {upsert.isPending ? "保存中…" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminExchangeGuide() {
  const { user, isAuthenticated, loading } = useAuth();
  const [catDialog, setCatDialog] = useState<{ open: boolean; initial: CategoryFormData; isEdit: boolean }>({
    open: false, initial: emptyCategoryForm(), isEdit: false,
  });
  const [supportDialog, setSupportDialog] = useState<{ open: boolean; initial: SupportFormData }>({
    open: false, initial: emptySupportForm(),
  });
  const [filterFeature, setFilterFeature] = useState<string>("all");
  const [filterExchange, setFilterExchange] = useState<string>("all");

  const { data: categories = [], isLoading: catLoading } = trpc.exchangeGuide.categories.useQuery();
  const { data: allSupport = [], isLoading: supportLoading } = trpc.adminExchangeGuide.allSupport.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );
  const utils = trpc.useUtils();

  const deleteCategory = trpc.adminExchangeGuide.deleteCategory.useMutation({
    onSuccess: () => { toast.success("分类已删除"); utils.exchangeGuide.categories.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteSupport = trpc.adminExchangeGuide.deleteSupport.useMutation({
    onSuccess: () => { toast.success("数据已删除"); utils.adminExchangeGuide.allSupport.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">加载中…</div>;
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Shield className="w-12 h-12 text-muted-foreground" />
        <p className="text-lg font-medium">仅管理员可访问此页面</p>
        <Link href="/"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />返回首页</Button></Link>
      </div>
    );
  }

  const filteredSupport = allSupport.filter(s =>
    (filterFeature === "all" || s.featureSlug === filterFeature) &&
    (filterExchange === "all" || s.exchangeSlug === filterExchange)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/exchange-guide">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />返回指南</Button>
          </Link>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">交易所指南 — 数据管理</h1>
          </div>
          <Badge variant="secondary" className="ml-auto">管理员</Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="categories">
          <TabsList className="mb-6">
            <TabsTrigger value="categories">功能分类 ({categories.length})</TabsTrigger>
            <TabsTrigger value="support">交易所支持数据 ({allSupport.length})</TabsTrigger>
          </TabsList>

          {/* ── Tab: Feature Categories ── */}
          <TabsContent value="categories">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">管理 /exchange-guide 页面的功能分类（如现货、合约、TradFi 等）</p>
              <Button size="sm" onClick={() => setCatDialog({ open: true, initial: emptyCategoryForm(), isEdit: false })}>
                <Plus className="w-4 h-4 mr-1" />新增分类
              </Button>
            </div>
            {catLoading ? (
              <div className="text-center py-8 text-muted-foreground">加载中…</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <Card key={cat.slug} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{cat.icon}</span>
                          <div>
                            <CardTitle className="text-base">{cat.nameZh}</CardTitle>
                            <p className="text-xs text-muted-foreground">{cat.nameEn}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => setCatDialog({ open: true, initial: { slug: cat.slug, nameZh: cat.nameZh, nameEn: cat.nameEn, icon: cat.icon, descZh: cat.descZh, descEn: cat.descEn, difficulty: cat.difficulty, sortOrder: cat.sortOrder }, isEdit: true })}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => { if (confirm(`确认删除「${cat.nameZh}」分类？此操作不可撤销。`)) deleteCategory.mutate({ slug: cat.slug }); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2">{cat.descZh}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{cat.difficulty}</Badge>
                        <Badge variant="outline" className="text-xs">排序 {cat.sortOrder}</Badge>
                        <Badge variant="outline" className="text-xs font-mono">{cat.slug}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Feature Support ── */}
          <TabsContent value="support">
            <div className="flex flex-wrap gap-3 items-center mb-4">
              <p className="text-sm text-muted-foreground flex-1">管理每家交易所对每个功能的支持详情、KYC 要求、手续费等级等</p>
              <div className="flex gap-2 items-center">
                <Select value={filterFeature} onValueChange={setFilterFeature}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="筛选功能" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部功能</SelectItem>
                    {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.icon} {c.nameZh}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterExchange} onValueChange={setFilterExchange}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="筛选交易所" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部交易所</SelectItem>
                    {EXCHANGES.map(e => <SelectItem key={e} value={e}>{e.toUpperCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => setSupportDialog({ open: true, initial: emptySupportForm() })}>
                  <Plus className="w-4 h-4 mr-1" />新增
                </Button>
              </div>
            </div>
            {supportLoading ? (
              <div className="text-center py-8 text-muted-foreground">加载中…</div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">交易所</th>
                      <th className="text-left px-3 py-2 font-medium">功能</th>
                      <th className="text-left px-3 py-2 font-medium">支持</th>
                      <th className="text-left px-3 py-2 font-medium">等级</th>
                      <th className="text-left px-3 py-2 font-medium">KYC</th>
                      <th className="text-left px-3 py-2 font-medium">手续费</th>
                      <th className="text-left px-3 py-2 font-medium">地区</th>
                      <th className="text-right px-3 py-2 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSupport.map((s) => {
                      const cat = categories.find(c => c.slug === s.featureSlug);
                      return (
                        <tr key={`${s.exchangeSlug}-${s.featureSlug}`} className="border-t hover:bg-muted/20 transition-colors">
                          <td className="px-3 py-2 font-medium uppercase">{s.exchangeSlug}</td>
                          <td className="px-3 py-2">
                            <span className="mr-1">{cat?.icon}</span>
                            <span className="text-muted-foreground">{cat?.nameZh || s.featureSlug}</span>
                          </td>
                          <td className="px-3 py-2">
                            {s.supported ? <Badge variant="default" className="text-xs bg-green-600">支持</Badge>
                              : <Badge variant="secondary" className="text-xs">不支持</Badge>}
                            {s.highlight ? <span className="ml-1 text-yellow-500">⭐</span> : null}
                          </td>
                          <td className="px-3 py-2 text-xs max-w-[120px] truncate" title={s.levelZh}>{s.levelZh}</td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-xs">{s.kycLevel || "—"}</Badge>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-xs">{s.feeLevel || "—"}</Badge>
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground max-w-[100px] truncate" title={s.supportedRegions || ""}>{s.supportedRegions || "—"}</td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" className="h-7 w-7"
                                onClick={() => setSupportDialog({
                                  open: true,
                                  initial: {
                                    exchangeSlug: s.exchangeSlug,
                                    featureSlug: s.featureSlug,
                                    supported: s.supported,
                                    levelZh: s.levelZh,
                                    levelEn: s.levelEn,
                                    detailZh: s.detailZh,
                                    detailEn: s.detailEn,
                                    maxLeverage: s.maxLeverage || "",
                                    feeInfo: s.feeInfo || "",
                                    highlight: s.highlight,
                                    kycLevel: s.kycLevel || "standard",
                                    supportedRegions: s.supportedRegions || "",
                                    feeLevel: s.feeLevel || "低",
                                    notes: s.notes || "",
                                  }
                                })}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => { if (confirm(`确认删除 ${s.exchangeSlug.toUpperCase()} 的 ${s.featureSlug} 数据？`)) deleteSupport.mutate({ exchangeSlug: s.exchangeSlug, featureSlug: s.featureSlug }); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredSupport.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">暂无数据</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CategoryDialog
        open={catDialog.open}
        onClose={() => setCatDialog(p => ({ ...p, open: false }))}
        initial={catDialog.initial}
        isEdit={catDialog.isEdit}
      />
      <SupportDialog
        open={supportDialog.open}
        onClose={() => setSupportDialog(p => ({ ...p, open: false }))}
        initial={supportDialog.initial}
        categories={categories}
      />
    </div>
  );
}

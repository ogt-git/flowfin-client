import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { motion, type Variants } from 'motion/react';
import { User, CreditCard, TrendingUp, LayoutGrid, Trash2, PlusCircle, Loader2, ChevronDown, ChevronUp, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { fetchConnections, deleteConnection } from '../../api/codef';
import { fetchPortfolioHistory } from '../../api/portfolio';
import { fetchMe, updateMe, deleteMe } from '../../api/user';
import type { CodefConnection } from '../../types/codef';
import type { Portfolio, RecommendedAsset } from '../../types/portfolio';
import type { UserInfo } from '../../api/user';
import { CARD_ORGANIZATIONS, STOCK_ORGANIZATIONS } from '../../types/card';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const CHART_COLORS = ['#0A3D5C', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const RISK_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  CONSERVATIVE:            { label: '안정형',    color: 'text-blue-700',   bg: 'bg-blue-50' },
  MODERATELY_CONSERVATIVE: { label: '안정추구형', color: 'text-teal-700',   bg: 'bg-teal-50' },
  MODERATE:                { label: '위험중립형', color: 'text-green-700',  bg: 'bg-green-50' },
  MODERATELY_AGGRESSIVE:   { label: '적극투자형', color: 'text-orange-700', bg: 'bg-orange-50' },
  AGGRESSIVE:              { label: '공격투자형', color: 'text-red-700',    bg: 'bg-red-50' },
};

function formatAmount(n: number) {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(0)}만`;
  return n.toLocaleString();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function orgName(code: string, type: 'CARD' | 'STOCK') {
  if (type === 'CARD') return CARD_ORGANIZATIONS.find((o) => o.code === code)?.name ?? code;
  return STOCK_ORGANIZATIONS.find((o) => o.code === code)?.name ?? code;
}

function RiskBadge({ riskType }: { riskType: string }) {
  const info = RISK_LABEL[riskType] ?? { label: riskType, color: 'text-gray-700', bg: 'bg-gray-100' };
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${info.bg} ${info.color}`}>
      {info.label}
    </span>
  );
}

/* ────── 연동 계정 탭 ────── */
function ConnectionItem({
  conn,
  onDelete,
}: {
  conn: CodefConnection;
  onDelete: (id: number) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteConnection(conn.id);
      onDelete(conn.id);
      toast.success('연동이 해제되었습니다.');
    } catch {
      toast.error('연동 해제에 실패했습니다.');
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${conn.accountType === 'CARD' ? 'bg-blue-50' : 'bg-emerald-50'}`}>
          {conn.accountType === 'CARD'
            ? <CreditCard className="h-4 w-4 text-blue-600" />
            : <TrendingUp className="h-4 w-4 text-emerald-600" />
          }
        </div>
        <div>
          <p className="text-sm font-medium">{orgName(conn.organizationCode, conn.accountType)}</p>
          <p className="text-xs text-muted-foreground">{conn.accountNumber} · {formatDate(conn.createdAt)} 연동</p>
        </div>
      </div>
      {confirm ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">해제할까요?</span>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : '확인'}
          </button>
          <button onClick={() => setConfirm(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary">
            취소
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirm(true)}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> 해제
        </button>
      )}
    </div>
  );
}

function ConnectionsTab({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [connections, setConnections] = useState<CodefConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections()
      .then(setConnections)
      .catch(() => toast.error('연동 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = connections.filter((c) => c.accountType === 'CARD');
  const stocks = connections.filter((c) => c.accountType === 'STOCK');

  function handleDelete(id: number) {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#0A3D5C]" /></div>;

  return (
    <div className="space-y-8">
      {/* 카드 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-medium">연동 카드</h4>
          <button
            onClick={() => onNavigate('/card/link')}
            className="flex items-center gap-1.5 text-sm text-[#0A3D5C] hover:underline"
          >
            <PlusCircle className="h-4 w-4" /> 카드 추가
          </button>
        </div>
        {cards.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">연동된 카드가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {cards.map((c) => <ConnectionItem key={c.id} conn={c} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {/* 증권 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-medium">연동 증권</h4>
          <button
            onClick={() => onNavigate('/asset/link')}
            className="flex items-center gap-1.5 text-sm text-[#0A3D5C] hover:underline"
          >
            <PlusCircle className="h-4 w-4" /> 증권 추가
          </button>
        </div>
        {stocks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">연동된 증권 계좌가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {stocks.map((c) => <ConnectionItem key={c.id} conn={c} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────── 포트폴리오 이력 탭 ────── */
function HistoryItem({ portfolio }: { portfolio: Portfolio }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{formatDate(portfolio.createdAt)}</span>
          <RiskBadge riskType={portfolio.riskType} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">투자가능 {formatAmount(portfolio.investableAmount)}원</span>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-5 pb-4 pt-3 space-y-2">
          {portfolio.recommendedAssets.map((asset: RecommendedAsset, i: number) => (
            <div key={i} className={`flex items-center gap-4 rounded-xl px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-secondary/30'}`}>
              <div className="flex h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <div className="flex-1">
                <p className="font-medium text-sm">{asset.assetClass}</p>
                {asset.description && <p className="mt-0.5 text-xs text-muted-foreground">{asset.description}</p>}
              </div>
              <span className="text-sm font-semibold">{asset.ratio}%</span>
              <span className="text-xs text-muted-foreground w-20 text-right">{formatAmount(asset.amount)}원</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioHistoryTab() {
  const [history, setHistory] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioHistory()
      .then(setHistory)
      .catch(() => toast.error('포트폴리오 이력을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#0A3D5C]" /></div>;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16">
        <LayoutGrid className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">아직 포트폴리오 추천 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((p) => <HistoryItem key={p.id} portfolio={p} />)}
    </div>
  );
}

/* ────── 회원정보 탭 ────── */
const RISK_OPTIONS = [
  { type: 'CONSERVATIVE',            label: '안정형',    desc: '원금 보전 최우선',              colorClass: 'text-blue-600',   borderSel: 'border-blue-400',   bgSel: 'bg-blue-50' },
  { type: 'MODERATELY_CONSERVATIVE', label: '안정추구형', desc: '안정성 중시, 소극적 투자',       colorClass: 'text-teal-600',   borderSel: 'border-teal-400',   bgSel: 'bg-teal-50' },
  { type: 'MODERATE',                label: '위험중립형', desc: '수익·안정성 균형 추구',          colorClass: 'text-emerald-600', borderSel: 'border-emerald-400', bgSel: 'bg-emerald-50' },
  { type: 'MODERATELY_AGGRESSIVE',   label: '적극투자형', desc: '높은 수익 위해 위험 감수',       colorClass: 'text-orange-600', borderSel: 'border-orange-400', bgSel: 'bg-orange-50' },
  { type: 'AGGRESSIVE',              label: '공격투자형', desc: '최고 수익 위해 높은 위험 수용',  colorClass: 'text-red-600',    borderSel: 'border-red-400',    bgSel: 'bg-red-50' },
];

function ProfileTab({ userInfo, onLogout }: { userInfo: UserInfo; onLogout: () => void }) {
  const [name, setName] = useState(userInfo.name);
  const [selectedRisk, setSelectedRisk] = useState(userInfo.riskType);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingRisk, setSavingRisk] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveRisk() {
    setSavingRisk(true);
    try {
      await updateMe({ riskType: selectedRisk });
      localStorage.setItem('riskType', selectedRisk);
      toast.success('투자 성향이 변경되었습니다.');
    } catch {
      toast.error('투자 성향 변경에 실패했습니다.');
    } finally {
      setSavingRisk(false);
    }
  }

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      await updateMe({ name: name.trim() });
      localStorage.setItem('name', name.trim());
      toast.success('이름이 변경되었습니다.');
    } catch {
      toast.error('이름 변경에 실패했습니다.');
    } finally {
      setSavingName(false);
    }
  }

  async function handleSavePw(e: FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    if (newPw.length < 8) { toast.error('새 비밀번호는 8자 이상이어야 합니다.'); return; }
    setSavingPw(true);
    try {
      await updateMe({ currentPassword: currentPw, newPassword: newPw });
      toast.success('비밀번호가 변경되었습니다.');
      setCurrentPw('');
      setNewPw('');
    } catch {
      toast.error('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
    } finally {
      setSavingPw(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMe();
      localStorage.clear();
      onLogout();
    } catch {
      toast.error('회원 탈퇴에 실패했습니다.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* 이름 변경 */}
      <form onSubmit={handleSaveName} className="rounded-2xl border border-border bg-white p-6">
        <h4 className="mb-4 font-medium">이름 변경</h4>
        <div className="mb-4">
          <label className="mb-2 block text-sm text-muted-foreground">이메일</label>
          <p className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">{userInfo.email}</p>
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm text-muted-foreground">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
          />
        </div>
        <button
          type="submit"
          disabled={savingName || name.trim() === userInfo.name}
          className="w-full rounded-xl bg-[#0A3D5C] py-3 text-sm text-white hover:bg-[#0A3D5C]/90 disabled:opacity-60"
        >
          {savingName ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : '저장'}
        </button>
      </form>

      {/* 투자 성향 변경 */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <h4 className="mb-4 font-medium">투자 성향</h4>
        <div className="mb-4 space-y-2">
          {RISK_OPTIONS.map((opt) => {
            const isSelected = selectedRisk === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setSelectedRisk(opt.type)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  isSelected
                    ? `${opt.bgSel} ${opt.borderSel}`
                    : 'border-border hover:bg-secondary/50'
                }`}
              >
                <div className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${isSelected ? opt.borderSel : 'border-border'}`}>
                  {isSelected && <div className={`h-2 w-2 rounded-full ${opt.bgSel.replace('bg-', 'bg-').replace('-50', '-500')}`} />}
                </div>
                <div>
                  <span className={`text-sm font-medium ${isSelected ? opt.colorClass : 'text-foreground'}`}>{opt.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{opt.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleSaveRisk}
          disabled={savingRisk || selectedRisk === userInfo.riskType}
          className="w-full rounded-xl bg-[#0A3D5C] py-3 text-sm text-white hover:bg-[#0A3D5C]/90 disabled:opacity-60"
        >
          {savingRisk ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : '저장'}
        </button>
      </div>

      {/* 비밀번호 변경 */}
      <form onSubmit={handleSavePw} className="rounded-2xl border border-border bg-white p-6">
        <h4 className="mb-4 font-medium">비밀번호 변경</h4>
        <div className="mb-3">
          <label className="mb-2 block text-sm text-muted-foreground">현재 비밀번호</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="현재 비밀번호 입력"
              className="w-full rounded-xl border border-border bg-input-background px-4 py-3 pr-10 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
            />
            <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm text-muted-foreground">새 비밀번호</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="새 비밀번호 (8자 이상)"
              className="w-full rounded-xl border border-border bg-input-background px-4 py-3 pr-10 text-sm outline-none transition-colors focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/20"
            />
            <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={savingPw || !currentPw || !newPw}
          className="w-full rounded-xl bg-[#0A3D5C] py-3 text-sm text-white hover:bg-[#0A3D5C]/90 disabled:opacity-60"
        >
          {savingPw ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : '비밀번호 변경'}
        </button>
      </form>

      {/* 회원 탈퇴 */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h4 className="mb-1 font-medium text-red-700">회원 탈퇴</h4>
        <p className="mb-4 text-sm text-red-600/80">탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="rounded-xl border border-red-300 px-4 py-2.5 text-sm text-red-600 hover:bg-red-100 transition-colors"
        >
          회원 탈퇴
        </button>
      </div>

      {/* 탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4"
          >
            <button onClick={() => setShowDeleteModal(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="mb-2 mt-4">정말 탈퇴하시겠어요?</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              모든 지출, 자산, 포트폴리오 데이터가 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-xl border border-border py-2.5 text-sm hover:bg-secondary">
                취소
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm text-white hover:bg-red-600 disabled:opacity-60">
                {deleting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : '탈퇴하기'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ────── 마이페이지 ────── */
type Tab = 'connections' | 'portfolio' | 'profile';

export default function MyPage({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('connections');
  const [userInfo] = useState<UserInfo>(() => fetchMe());

  const tabs: { key: Tab; label: string }[] = [
    { key: 'connections', label: '연동 계정' },
    { key: 'portfolio',   label: '포트폴리오 이력' },
    { key: 'profile',     label: '회원정보' },
  ];

  return (
    <motion.div
      className="p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 헤더 */}
      <motion.div variants={itemVariants} className="mb-8 flex items-center gap-3">
        <User className="h-5 w-5 text-[#0A3D5C]" />
        <h2 className="text-xl font-medium">마이페이지</h2>
      </motion.div>

      {/* 프로필 요약 */}
      {userInfo && (
        <motion.div variants={itemVariants} className="mb-8 flex items-center gap-4 rounded-2xl border border-border bg-white p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A3D5C] to-[#10B981] text-xl text-white shadow-md">
            {userInfo.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{userInfo.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{userInfo.email}</p>
          </div>
          <div className="ml-auto">
            <RiskBadge riskType={userInfo.riskType} />
          </div>
        </motion.div>
      )}

      {/* 탭 */}
      <motion.div variants={itemVariants} className="mb-6 flex gap-1 rounded-2xl border border-border bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-[#0A3D5C] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* 탭 콘텐츠 */}
      <motion.div variants={itemVariants}>
        {tab === 'connections' && <ConnectionsTab onNavigate={navigate} />}
        {tab === 'portfolio'   && <PortfolioHistoryTab />}
        {tab === 'profile'     && <ProfileTab userInfo={userInfo} onLogout={onLogout} />}
      </motion.div>
    </motion.div>
  );
}

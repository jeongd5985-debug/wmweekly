// /api/share/save.js
// Upstash Redis에 편집 상태를 저장하고 공유 ID를 반환

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data } = req.body;
  if (!data || typeof data !== 'string') {
    return res.status(400).json({ error: 'data 필드가 필요합니다' });
  }

  const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({ error: 'Redis 환경변수 미설정' });
  }

  // 랜덤 8자 ID 생성
  const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  try {
    // Upstash REST API: SET key value EX 604800 (7일 TTL)
    const r = await fetch(`${UPSTASH_URL}/set/wm-share-${id}/${encodeURIComponent(data)}/EX/604800`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
    if (!r.ok) throw new Error('Upstash 저장 실패: ' + r.status);

    return res.status(200).json({ id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

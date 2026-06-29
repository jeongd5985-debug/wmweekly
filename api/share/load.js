// /api/share/load.js
// Upstash Redis에서 공유 ID로 편집 상태를 불러옴

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'id 파라미터가 필요합니다' });
  }

  const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({ error: 'Redis 환경변수 미설정' });
  }

  try {
    const r = await fetch(`${UPSTASH_URL}/get/wm-share-${id}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });
    if (!r.ok) throw new Error('Upstash 조회 실패: ' + r.status);

    const json = await r.json();
    if (json.result === null) {
      return res.status(404).json({ error: '링크가 만료되었거나 존재하지 않습니다 (7일 TTL)' });
    }

    const data = decodeURIComponent(json.result);
    return res.status(200).json({ data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

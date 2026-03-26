import axios from 'axios';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { fetchCricketHistory, fetchLiveScores } from './sportsApi';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const RSS_XML_WITH_DOMESTIC_FIXTURES = `
<rss>
  <channel>
    <item>
      <title>Victoria v South Australia 55/3 *</title>
      <pubDate>Thu, 26 Mar 2026 06:00:00 GMT</pubDate>
      <link>https://example.com/match-1</link>
    </item>
    <item>
      <title>Lahore Qalandars v Hyderabad Kingsmen</title>
      <pubDate>Thu, 26 Mar 2026 07:00:00 GMT</pubDate>
      <link>https://example.com/match-2</link>
    </item>
    <item>
      <title>General cricket headline without teams</title>
      <pubDate>Thu, 26 Mar 2026 08:00:00 GMT</pubDate>
      <link>https://example.com/non-match</link>
    </item>
  </channel>
</rss>
`;

const RSS_XML_WITH_ICC_AND_NON_ICC = `
<rss>
  <channel>
    <item>
      <title>ICC Champions Trophy: India v Pakistan</title>
      <pubDate>Thu, 26 Mar 2026 09:00:00 GMT</pubDate>
      <link>https://example.com/icc-1</link>
    </item>
    <item>
      <title>Big Bash League: Sydney Sixers v Melbourne Stars</title>
      <pubDate>Thu, 26 Mar 2026 10:00:00 GMT</pubDate>
      <link>https://example.com/domestic-1</link>
    </item>
  </channel>
</rss>
`;

describe('sportsApi ICC international filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty cricket live rows when feed has no ICC international matches', async () => {
    const axiosGet = axios.get as unknown as Mock;
    axiosGet.mockResolvedValue({ data: RSS_XML_WITH_DOMESTIC_FIXTURES });

    const rows = await fetchLiveScores('CRICKET');

    expect(rows).toHaveLength(0);
  });

  it('returns only ICC international matches for cricket history', async () => {
    const axiosGet = axios.get as unknown as Mock;
    axiosGet.mockResolvedValue({ data: RSS_XML_WITH_ICC_AND_NON_ICC });

    const rows = await fetchCricketHistory(60);

    expect(rows).toHaveLength(1);
    expect(rows.every((r) => r.status === 'FT')).toBe(true);
    expect(rows[0]?.home).toBe('ICC Champions Trophy: India');
    expect(rows[0]?.away).toBe('Pakistan');
  });
});

const Item = require('../models/Item');

// GET /api/matches/:itemId
// Returns potential matches for a given lost/found item
exports.getMatches = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item || !item.isVisible) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    // Search for opposite type items
    const oppositeType = item.type === 'lost' ? 'found' : 'lost';

    const candidates = await Item.find({
      type: oppositeType,
      isVisible: true,
      status: 'active',
      _id: { $ne: item._id }
    })
      .populate('reporter', 'name')
      .lean();

    // Scoring algorithm
    const scored = candidates.map(candidate => {
      let score = 0;
      const reasons = [];

      // 1. Same category (highest weight)
      if (candidate.category === item.category) {
        score += 40;
        reasons.push('Same category');
      }

      // 2. Keyword overlap in title
      const itemTitleWords = item.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const candidateTitleWords = candidate.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const titleOverlap = itemTitleWords.filter(w => candidateTitleWords.includes(w));
      if (titleOverlap.length > 0) {
        score += Math.min(titleOverlap.length * 15, 30);
        reasons.push(`Similar title keywords: "${titleOverlap.join(', ')}"`);
      }

      // 3. Description keyword overlap
      const itemDescWords = item.description.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const candDescWords = candidate.description.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const descOverlap = itemDescWords.filter(w => candDescWords.includes(w));
      if (descOverlap.length > 0) {
        score += Math.min(descOverlap.length * 5, 20);
        reasons.push('Similar description keywords');
      }

      // 4. Location similarity
      const itemLoc = item.location.toLowerCase();
      const candLoc = candidate.location.toLowerCase();
      if (itemLoc === candLoc) {
        score += 20;
        reasons.push('Same location');
      } else {
        const locWords = itemLoc.split(/\s+/);
        const candLocWords = candLoc.split(/\s+/);
        const locOverlap = locWords.filter(w => w.length > 2 && candLocWords.includes(w));
        if (locOverlap.length > 0) {
          score += 10;
          reasons.push('Nearby location');
        }
      }

      // 5. Date proximity (within 7 days)
      const daysDiff = Math.abs((new Date(item.date) - new Date(candidate.date)) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 3) {
        score += 15;
        reasons.push('Dates within 3 days');
      } else if (daysDiff <= 7) {
        score += 8;
        reasons.push('Dates within 7 days');
      }

      return { ...candidate, matchScore: score, matchReasons: reasons };
    });

    // Filter meaningful matches and sort by score
    const matches = scored
      .filter(m => m.matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    res.json({ success: true, matches, totalCandidates: candidates.length });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ success: false, message: 'Item not found.' });
    console.error('getMatches error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch matches.' });
  }
};

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch and parse the website
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Extract key information
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1s = $('h1').map((_, el) => $(el).text()).get().join(' | ');
    const h2s = $('h2').map((_, el) => $(el).text()).get().slice(0, 10).join(' | ');

    // Extract body text (limited)
    $('script, style, nav, footer').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000);

    // Call Anthropic API for analysis
    const analysisPrompt = `You are a complete marketing expert team analyzing a website. Provide comprehensive, actionable insights.

Website URL: ${url}
Title: ${title}
Meta Description: ${metaDescription}
Main Headings (H1): ${h1s}
Subheadings (H2): ${h2s}
Content Sample: ${bodyText}

Provide a detailed marketing analysis in the following format (be specific, actionable, and comprehensive):

BRAND_ANALYSIS:
[3-4 sentences analyzing the brand positioning, voice, values, and unique selling proposition]

TARGET_AUDIENCE:
[3-4 sentences identifying the primary target audience, demographics, psychographics, and customer personas]

COMPETITIVE_POSITION:
[3-4 sentences analyzing market position, competitive advantages, and differentiation strategy]

CONTENT_STRATEGY:
[3-4 sentences with specific content recommendations, topics to cover, and content calendar suggestions]

SEO_ANALYSIS:
[3-4 sentences analyzing current SEO status, keyword opportunities, and technical SEO recommendations]

CONVERSION_OPTIMIZATION:
[3-4 sentences with specific CTA improvements, landing page optimizations, and funnel recommendations]

SOCIAL_MEDIA_STRATEGY:
[3-4 sentences recommending platforms, posting strategy, content types, and engagement tactics]

PAID_ADVERTISING:
[3-4 sentences with PPC strategy, budget allocation, platform recommendations, and targeting suggestions]

EMAIL_MARKETING:
[3-4 sentences with email campaign ideas, segmentation strategy, and automation recommendations]

ANALYTICS_INSIGHTS:
[3-4 sentences identifying key metrics to track, analytics setup, and data-driven optimization opportunities]`;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      throw new Error('AI analysis failed');
    }

    const anthropicData = await anthropicResponse.json();
    const analysisText = anthropicData.content[0].text;

    // Parse the response
    const sections = {
      brandAnalysis: extractSection(analysisText, 'BRAND_ANALYSIS'),
      targetAudience: extractSection(analysisText, 'TARGET_AUDIENCE'),
      competitivePosition: extractSection(analysisText, 'COMPETITIVE_POSITION'),
      contentStrategy: extractSection(analysisText, 'CONTENT_STRATEGY'),
      seoAnalysis: extractSection(analysisText, 'SEO_ANALYSIS'),
      conversionOptimization: extractSection(analysisText, 'CONVERSION_OPTIMIZATION'),
      socialMediaStrategy: extractSection(analysisText, 'SOCIAL_MEDIA_STRATEGY'),
      paidAdvertising: extractSection(analysisText, 'PAID_ADVERTISING'),
      emailMarketing: extractSection(analysisText, 'EMAIL_MARKETING'),
      analyticsInsights: extractSection(analysisText, 'ANALYTICS_INSIGHTS'),
    };

    return NextResponse.json({ analysis: sections });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze website' },
      { status: 500 }
    );
  }
}

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`${sectionName}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Z_]+:|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : 'Analysis not available';
}

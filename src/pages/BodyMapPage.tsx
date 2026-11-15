import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { healthApi } from '../api';
import type { EvaluationResult, IndicatorId, Status } from '../core/types';

interface OrganDef {
  id: string;
  name: string;
  img: string;
  indicators: IndicatorId[];
}

const BODY_MODELS = {
  male: {
    img: {
      href: '/body-silhouette-male.svg',
      x: '390',
      y: '25',
      width: '244',
      height: '525',
    },
    zones: {
      head: 'M 486,42 L 538,42 L 540,104 L 531,120 L 493,120 L 484,104 Z',
      torso: 'M 493,120 L 531,120 L 560,136 L 560,210 L 555,270 L 469,270 L 464,210 L 464,136 Z',
      hips: 'M 469,270 L 555,270 L 563,322 L 556,335 L 512,324 L 468,335 L 461,322 Z',
      'right-arm': 'M 464,136 L 464,210 L 456,280 L 452,350 L 428,350 L 430,260 L 442,150 Z',
      'left-arm': 'M 560,136 L 582,150 L 594,260 L 598,350 L 572,350 L 568,280 L 560,210 Z',
      'right-leg': 'M 468,335 L 512,324 L 508,430 L 492,535 L 444,535 L 460,440 Z',
      'left-leg': 'M 512,324 L 556,335 L 564,440 L 580,535 L 532,535 L 516,430 Z',
    },
  },
  female: {
    img: {
      href: '/body-silhouette-female-dark.svg',
      x: '390',
      y: '25',
      width: '244',
      height: '525',
    },
    zones: {
      head: 'M 489,45 L 535,45 L 535,102 L 526,120 L 498,120 L 489,102 Z',
      torso:
        'M 498,120 L 526,120 L 555,135 L 553,185 L 545,232 L 556,266 L 468,266 L 479,232 L 471,185 L 469,135 Z',
      hips: 'M 468,266 L 556,266 L 565,305 L 560,335 L 512,324 L 464,335 L 459,305 Z',
      'right-arm': 'M 469,135 L 471,185 L 462,265 L 456,345 L 436,345 L 438,260 L 449,150 Z',
      'left-arm': 'M 555,135 L 575,150 L 586,260 L 588,345 L 568,345 L 562,265 L 553,185 Z',
      'right-leg': 'M 464,335 L 512,324 L 504,430 L 497,532 L 468,532 L 474,430 Z',
      'left-leg': 'M 512,324 L 560,335 L 550,430 L 556,532 L 527,532 L 520,430 Z',
    },
  },
};

const ZONE_ORGANS: Record<string, OrganDef[]> = {
  head: [
    {
      id: 'brain',
      name: 'Brain',
      img: '/organs/brain.svg',
      indicators: ['sleep', 'mood', 'blood_glucose', 'blood_pressure'],
    },
    {
      id: 'eyes',
      name: 'Eyes',
      img: '/organs/eyes.svg',
      indicators: ['blood_pressure', 'blood_glucose'],
    },
  ],
  torso: [
    { id: 'lungs', name: 'Lungs', img: '/organs/lungs.svg', indicators: ['heart_rate'] },
    {
      id: 'heart',
      name: 'Heart',
      img: '/organs/heart.svg',
      indicators: ['heart_rate', 'blood_pressure'],
    },
    {
      id: 'liver',
      name: 'Liver',
      img: '/organs/liver.svg',
      indicators: ['blood_glucose', 'body_temperature'],
    },
    {
      id: 'digestive-system',
      name: 'Digestive System',
      img: '/organs/digestive-system.svg',
      indicators: ['blood_glucose'],
    },
    { id: 'kidneys', name: 'Kidneys', img: '/organs/kidneys.svg', indicators: ['blood_pressure'] },
  ],
  hips: [
    {
      id: 'urinary-system',
      name: 'Urinary System',
      img: '/organs/urinary-system.svg',
      indicators: ['body_temperature'],
    },
  ],
  'left-arm': [],
  'right-arm': [],
  'left-leg': [],
  'right-leg': [],
};

const STATUS_STYLE: Record<Status, { fill: string; stroke: string }> = {
  normal: { fill: 'rgba(16, 185, 129, 0.28)', stroke: '#10b981' },
  attention: { fill: 'rgba(245, 158, 11, 0.34)', stroke: '#f59e0b' },
  critical: { fill: 'rgba(239, 68, 68, 0.38)', stroke: '#ef4444' },
};

const STATUS_ICON: Record<Status, string> = {
  normal: '✓',
  attention: '⚠',
  critical: '!',
};

const SEVERITY: Record<Status, number> = { normal: 0, attention: 1, critical: 2 };

function pickWorstStatus(statuses: Status[]): Status {
  return statuses.reduce<Status>((a, b) => (SEVERITY[b] > SEVERITY[a] ? b : a), 'normal');
}

function getOrganStatus(organ: OrganDef, evaluation: EvaluationResult): Status {
  if (organ.indicators.length === 0) return 'normal';
  return pickWorstStatus(organ.indicators.map((id) => evaluation.indicators[id].status));
}

function getZoneStatus(zoneId: string, evaluation: EvaluationResult): Status {
  const organs = ZONE_ORGANS[zoneId] || [];
  if (organs.length === 0) return 'normal';
  return pickWorstStatus(organs.map((organ) => getOrganStatus(organ, evaluation)));
}

export default function BodyMapPage() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [zone, setZone] = useState<string | null>(null);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    let active = true;
    healthApi.getEvaluation().then((res) => {
      if (active) setEvaluation(res);
    });
    return () => {
      active = false;
    };
  }, []);

  const model = BODY_MODELS[gender];

  if (!evaluation) {
    return <div className="body-zone-status">Loading telemetry...</div>;
  }

  const handleSelectZone = (zoneId: string) => {
    setZone(zoneId);
    setSelectedOrgan(null);
  };

  const organsInZone = zone ? ZONE_ORGANS[zone] || [] : [];

  return (
    <div className="body-map-layout">
      <div className="gender-switch">
        <button
          type="button"
          className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
          onClick={() => setGender('male')}
        >
          Male
        </button>
        <button
          type="button"
          className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
          onClick={() => setGender('female')}
        >
          Female
        </button>
      </div>

      <div className="body-zone-status">
        <span>Selected Zone: {zone || 'None'}</span>
        <span className={`status-pill status-${evaluation.overall}`}>
          {STATUS_ICON[evaluation.overall]} Overall: {evaluation.overall}
        </span>
      </div>

      <div className="body-workspace">
        <svg
          viewBox="390 25 244 525"
          style={{ maxWidth: '260px', height: 'auto', display: 'block', width: '100%' }}
        >
          <image
            href={model.img.href}
            x={model.img.x}
            y={model.img.y}
            width={model.img.width}
            height={model.img.height}
          />
          {Object.entries(model.zones).map(([zoneId, pathData]) => {
            const zoneStatus = getZoneStatus(zoneId, evaluation);
            const isSelected = zone === zoneId;
            const showHighlight = isSelected || zoneStatus !== 'normal';
            const colors = STATUS_STYLE[zoneStatus];

            return (
              <path
                key={zoneId}
                d={pathData}
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${zoneId} zone (${zoneStatus})`}
                fill={showHighlight ? colors.fill : 'transparent'}
                stroke={showHighlight ? colors.stroke : 'transparent'}
                strokeWidth={isSelected ? 2 : 1.5}
                onClick={() => handleSelectZone(zoneId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectZone(zoneId);
                  }
                }}
                style={{ cursor: 'pointer', transition: 'fill 0.15s ease, stroke 0.15s ease' }}
              />
            );
          })}
        </svg>

        {zone && (
          <div className="zone-details">
            <div className="zone-header">
              <h3>{zone}</h3>
              <button type="button" className="close-btn" onClick={() => setZone(null)}>
                Close
              </button>
            </div>

            {organsInZone.length === 0 ? (
              <div className="empty-organs-msg">No internal organs mapped to this zone.</div>
            ) : (
              organsInZone.map((organ) => {
                const organStatus = getOrganStatus(organ, evaluation);
                const isOpen = selectedOrgan === organ.id;
                const activeReasons = organ.indicators
                  .map((id) => ({ id, res: evaluation.indicators[id] }))
                  .filter((item) => item.res.latest.length > 0);

                return (
                  <div
                    className={`organ-item ${isOpen ? 'selected' : ''}`}
                    key={organ.id}
                    onClick={() => setSelectedOrgan(isOpen ? null : organ.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedOrgan(isOpen ? null : organ.id);
                      }
                    }}
                  >
                    <div className="organ-row">
                      <img
                        src={organ.img}
                        alt={organ.name}
                        className={organ.id === 'heart' ? 'heart-pulse' : undefined}
                      />
                      <div className="organ-meta">
                        <div className="organ-title">{organ.name}</div>
                        <span className={`status-pill status-${organStatus}`}>
                          {STATUS_ICON[organStatus]} {organStatus}
                        </span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="organ-reasons">
                        {activeReasons.length > 0 ? (
                          activeReasons.map(({ id, res }) => (
                            <div key={id} className={`organ-reason status-text-${res.status}`}>
                              {STATUS_ICON[res.status]} {res.reason}
                            </div>
                          ))
                        ) : (
                          <div className="status-text-normal">No telemetry recorded yet.</div>
                        )}
                        <Link
                          to="/measure"
                          className="organ-detail-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Record measurement →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

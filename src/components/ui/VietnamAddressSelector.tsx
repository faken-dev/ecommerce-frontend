import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../common/Icon';
import styles from './VietnamAddressSelector.module.css';

interface Props {
  onSelect: (data: { province: string; district: string; ward: string }) => void;
  initialValues?: { province: string; district: string; ward: string };
}

interface Item {
  code: number;
  name: string;
}

export const VietnamAddressSelector: React.FC<Props> = ({ onSelect, initialValues }) => {
  const [provinces, setProvinces] = useState<Item[]>([]);
  const [districts, setDistricts] = useState<Item[]>([]);
  const [wards, setWards] = useState<Item[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Item | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Item | null>(null);
  const [selectedWard, setSelectedWard] = useState<Item | null>(null);

  const [openDropdown, setOpenDropdown] = useState<'province' | 'district' | 'ward' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial values setup
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        if (initialValues?.province) {
          const p = data.find((x: any) => x.name === initialValues.province);
          if (p) setSelectedProvince(p);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data.districts);
          if (initialValues?.district && selectedProvince.name === initialValues.province) {
            const d = data.districts.find((x: any) => x.name === initialValues.district);
            if (d) setSelectedDistrict(d);
          }
        });
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
        .then(res => res.json())
        .then(data => {
          setWards(data.wards);
          if (initialValues?.ward && selectedDistrict.name === initialValues.district) {
             const w = data.wards.find((x: any) => x.name === initialValues.ward);
             if (w) setSelectedWard(w);
          }
        });
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProvinces = provinces.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDistricts = districts.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredWards = wards.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDropdown = (type: 'province' | 'district' | 'ward') => {
    setOpenDropdown(openDropdown === type ? null : type);
    setSearchTerm('');
  };

  const handleSelectProvince = (p: Item) => {
    setSelectedProvince(p);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setOpenDropdown(null);
    setSearchTerm('');
    onSelect({ province: p.name, district: '', ward: '' });
  };

  const handleSelectDistrict = (d: Item) => {
    setSelectedDistrict(d);
    setSelectedWard(null);
    setOpenDropdown(null);
    setSearchTerm('');
    onSelect({ province: selectedProvince?.name || '', district: d.name, ward: '' });
  };

  const handleSelectWard = (w: Item) => {
    setSelectedWard(w);
    setOpenDropdown(null);
    setSearchTerm('');
    onSelect({ 
      province: selectedProvince?.name || '', 
      district: selectedDistrict?.name || '', 
      ward: w.name 
    });
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      {/* Province */}
      <div className={styles.group}>
        <label className={styles.label}>Tỉnh / Thành phố</label>
        <div 
          className={`${styles.customSelect} ${openDropdown === 'province' ? styles.active : ''}`}
          onClick={() => handleOpenDropdown('province')}
        >
          <span className={selectedProvince ? styles.value : styles.placeholder}>
            {selectedProvince?.name || 'Chọn Tỉnh/Thành'}
          </span>
          <Icon.ChevronDown size={16} />
          
          <AnimatePresence>
            {openDropdown === 'province' && (
              <motion.div 
                className={styles.dropdown}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className={styles.searchBox} onClick={e => e.stopPropagation()}>
                  <Icon.Search size={14} />
                  <input 
                    autoFocus
                    placeholder="Tìm kiếm..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                  />
                </div>
                <div className={styles.optionsList}>
                  {filteredProvinces.map(p => (
                    <div key={p.code} className={styles.option} onClick={(e) => { e.stopPropagation(); handleSelectProvince(p); }}>
                      {p.name}
                    </div>
                  ))}
                  {filteredProvinces.length === 0 && <div className={styles.noResult}>Không tìm thấy</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* District */}
      <div className={styles.group}>
        <label className={styles.label}>Quận / Huyện</label>
        <div 
          className={`${styles.customSelect} ${!selectedProvince ? styles.disabled : ''} ${openDropdown === 'district' ? styles.active : ''}`}
          onClick={() => selectedProvince && handleOpenDropdown('district')}
        >
          <span className={selectedDistrict ? styles.value : styles.placeholder}>
            {selectedDistrict?.name || 'Chọn Quận/Huyện'}
          </span>
          <Icon.ChevronDown size={16} />

          <AnimatePresence>
            {openDropdown === 'district' && (
              <motion.div 
                className={styles.dropdown}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className={styles.searchBox} onClick={e => e.stopPropagation()}>
                  <Icon.Search size={14} />
                  <input 
                    autoFocus
                    placeholder="Tìm kiếm..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                  />
                </div>
                <div className={styles.optionsList}>
                  {filteredDistricts.map(d => (
                    <div key={d.code} className={styles.option} onClick={(e) => { e.stopPropagation(); handleSelectDistrict(d); }}>
                      {d.name}
                    </div>
                  ))}
                  {filteredDistricts.length === 0 && <div className={styles.noResult}>Không tìm thấy</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Ward */}
      <div className={styles.group}>
        <label className={styles.label}>Phường / Xã</label>
        <div 
          className={`${styles.customSelect} ${!selectedDistrict ? styles.disabled : ''} ${openDropdown === 'ward' ? styles.active : ''}`}
          onClick={() => selectedDistrict && handleOpenDropdown('ward')}
        >
          <span className={selectedWard ? styles.value : styles.placeholder}>
            {selectedWard?.name || 'Chọn Phường/Xã'}
          </span>
          <Icon.ChevronDown size={16} />

          <AnimatePresence>
            {openDropdown === 'ward' && (
              <motion.div 
                className={styles.dropdown}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className={styles.searchBox} onClick={e => e.stopPropagation()}>
                  <Icon.Search size={14} />
                  <input 
                    autoFocus
                    placeholder="Tìm kiếm..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                  />
                </div>
                <div className={styles.optionsList}>
                  {filteredWards.map(w => (
                    <div key={w.code} className={styles.option} onClick={(e) => { e.stopPropagation(); handleSelectWard(w); }}>
                      {w.name}
                    </div>
                  ))}
                  {filteredWards.length === 0 && <div className={styles.noResult}>Không tìm thấy</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

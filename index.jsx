import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Sun, User, MapPin, Phone, Calendar, BatteryCharging, Mail, CreditCard, Briefcase, Zap, Home, Wrench, Clock } from 'lucide-react';

export default function ContractForm() {
  // フォームの状態管理
  const [formData, setFormData] = useState({
    // 基本情報
    contractType: '自社', // 自社 or fit
    contractorName: '',
    postalCode: '',
    address: '',
    phone: '',
    email: '',
    
    // 契約・商材情報
    contractAmount: '',
    selectedProducts: [], // 選択された商材の配列 ['solar', 'battery', ...]
    
    // 商材詳細 - ソーラー
    solarManufacturer: '',
    solarCapacity: '',
    
    // 商材詳細 - 蓄電池
    batteryManufacturer: '',
    batteryCapacity: '',
    
    // 商材詳細 - エコキュート
    ecoCuteManufacturer: '',
    ecoCuteCapacity: '',
    
    // 商材詳細 - V2H
    v2hManufacturer: '',
    
    // 商材詳細 - IH
    ihManufacturer: '',
    
    // 担当者情報
    apStaffName: '', // AP担当者
    clStaffName: '', // CL担当者
    
    // 施工情報
    surveyDate: '', // 現調日
    constructionDate: '', // 施工日
    isConstructionUndecided: false, // 施工日未定フラグ
    
    notes: ''
  });

  // 送信状態の管理
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 商材リスト定義
  const PRODUCT_OPTIONS = [
    { id: 'solar', label: 'ソーラーパネル' },
    { id: 'battery', label: '蓄電池' },
    { id: 'ecocute', label: 'エコキュート' },
    { id: 'v2h', label: 'V2H' },
    { id: 'ih', label: 'IH' },
  ];

  // 設定値（ダミー）
  const CONFIG = {
    kintoneAppId: 'YOUR_KINTONE_APP_ID',
    lineGroupId: 'YOUR_LINE_GROUP_ID' 
  };

  // 入力ハンドラ
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'isConstructionUndecided') {
        setFormData(prev => ({ ...prev, [name]: checked }));
      } else if (name === 'products') {
        // 商材情報のチェックボックス処理
        const currentProducts = [...formData.selectedProducts];
        if (checked) {
          currentProducts.push(value);
        } else {
          const index = currentProducts.indexOf(value);
          if (index > -1) currentProducts.splice(index, 1);
        }
        setFormData(prev => ({ ...prev, selectedProducts: currentProducts }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 郵便番号から住所自動入力（簡易実装シミュレーション）
  // 実際にはAPIなどを利用しますが、ここではフォーカスアウト時に動作する枠組みだけ用意
  const handlePostalCodeBlur = () => {
    // ここに住所検索APIの処理などを記述可能
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // 1. Kintone用データ構築
      const kintoneBody = {
        app: CONFIG.kintoneAppId,
        record: {
          contract_type: { value: formData.contractType },
          contractor_name: { value: formData.contractorName },
          postal_code: { value: formData.postalCode },
          address: { value: formData.address },
          phone: { value: formData.phone },
          email: { value: formData.email },
          contract_amount: { value: formData.contractAmount },
          products: { value: formData.selectedProducts }, // Kintoneの複数選択フィールド等に対応
          
          // 詳細情報はJSON文字列化して保存するか、個別のフィールドに保存します
          solar_info: { value: formData.selectedProducts.includes('solar') ? `${formData.solarManufacturer} / ${formData.solarCapacity}kW` : '' },
          battery_info: { value: formData.selectedProducts.includes('battery') ? `${formData.batteryManufacturer} / ${formData.batteryCapacity}kWh` : '' },
          
          ap_staff: { value: formData.apStaffName },
          cl_staff: { value: formData.clStaffName },
          survey_date: { value: formData.surveyDate },
          construction_date: { value: formData.isConstructionUndecided ? '未定' : formData.constructionDate },
          notes: { value: formData.notes }
        }
      };

      console.log('Sending to Kintone:', kintoneBody);

      // 2. LINEメッセージ構築
      // 商材詳細のテキスト生成
      let productDetailsText = '';
      if (formData.selectedProducts.includes('solar')) productDetailsText += `  ☀️ ソーラー: ${formData.solarManufacturer} (${formData.solarCapacity}kW)\n`;
      if (formData.selectedProducts.includes('battery')) productDetailsText += `  🔋 蓄電池: ${formData.batteryManufacturer} (${formData.batteryCapacity}kWh)\n`;
      if (formData.selectedProducts.includes('ecocute')) productDetailsText += `  💧 エコキュート: ${formData.ecoCuteManufacturer} (${formData.ecoCuteCapacity}L)\n`;
      if (formData.selectedProducts.includes('v2h')) productDetailsText += `  🚗 V2H: ${formData.v2hManufacturer}\n`;
      if (formData.selectedProducts.includes('ih')) productDetailsText += `  🍳 IH: ${formData.ihManufacturer}\n`;

      const constructionDateText = formData.isConstructionUndecided 
        ? '未定' 
        : new Date(formData.constructionDate).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

      const surveyDateText = formData.surveyDate 
        ? new Date(formData.surveyDate).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '未入力';

      const lineMessage = {
        to: CONFIG.lineGroupId,
        messages: [
          {
            type: 'text',
            text: `🎉【成約速報】🎉\n\n` +
                  `担当: AP[${formData.apStaffName}] / CL[${formData.clStaffName}]\n` +
                  `契約種別: ${formData.contractType}\n\n` +
                  `■お客様: ${formData.contractorName} 様\n` +
                  `■住所: ${formData.address}\n` +
                  `■契約金額: ¥${Number(formData.contractAmount).toLocaleString()}\n\n` +
                  `■商材詳細:\n${productDetailsText || '  なし'}\n` +
                  `■スケジュール:\n` +
                  `  現調: ${surveyDateText}\n` +
                  `  施工: ${constructionDateText}\n\n` +
                  `事務局は契約処理を進めてください！`
          }
        ]
      };

      console.log('Sending to LINE:', lineMessage);

      // API送信シミュレーション
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      
      // 成功後、ページトップへスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setErrorMessage('送信に失敗しました。');
    }
  };

  // リセット処理
  const handleReset = () => {
    setFormData({
      contractType: '自社',
      contractorName: '',
      postalCode: '',
      address: '',
      phone: '',
      email: '',
      contractAmount: '',
      selectedProducts: [],
      solarManufacturer: '',
      solarCapacity: '',
      batteryManufacturer: '',
      batteryCapacity: '',
      ecoCuteManufacturer: '',
      ecoCuteCapacity: '',
      v2hManufacturer: '',
      ihManufacturer: '',
      apStaffName: '',
      clStaffName: '',
      surveyDate: '',
      constructionDate: '',
      isConstructionUndecided: false,
      notes: ''
    });
    setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-full shadow-lg">
              <Sun className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            契約者登録フォーム
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            ご成約おめでとうございます！詳細情報を入力してください。
          </p>
        </div>

        {/* メインフォームエリア */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          
          {status === 'success' ? (
            <div className="p-10 text-center animation-fade-in">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">登録完了！</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Kintoneへの登録とLINEグループへの通知が完了しました。<br/>
                事務局にて確認作業に入ります。
              </p>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                続けて新しい契約を入力
              </button>
            </div>
          ) : (
            <form className="divide-y divide-slate-100" onSubmit={handleSubmit}>
              
              {/* セクション1: 基本情報 */}
              <div className="p-6 sm:p-8 space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-500" />
                  お客様情報
                </h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* 契約種別 */}
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700">契約種別 <span className="text-red-500">*</span></label>
                    <select
                      name="contractType"
                      value={formData.contractType}
                      onChange={handleChange}
                      className="mt-1 block w-full py-3 px-3 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="自社">自社</option>
                      <option value="FIT">FIT</option>
                    </select>
                  </div>
                </div>

                {/* 契約者名 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">契約者名（お客様名） <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="contractorName"
                    required
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-3 border"
                    placeholder="例：山田 太郎"
                    value={formData.contractorName}
                    onChange={handleChange}
                  />
                </div>

                {/* 郵便番号 & 住所 */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700">郵便番号</label>
                    <input
                      type="text"
                      name="postalCode"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md py-3 px-3 border"
                      placeholder="123-4567"
                      value={formData.postalCode}
                      onChange={handleChange}
                      onBlur={handlePostalCodeBlur}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">設置場所住所 <span className="text-red-500">*</span></label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-3 border"
                        placeholder="例：東京都千代田区..."
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* 連絡先 */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">電話番号 <span className="text-red-500">*</span></label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-3 border"
                        placeholder="090-1234-5678"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">メールアドレス</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-3 border"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* セクション2: 商材情報 */}
              <div className="p-6 sm:p-8 space-y-6 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  契約・商材情報
                </h3>

                {/* 契約金額 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">契約金額 (税込) <span className="text-red-500">*</span></label>
                  <div className="mt-1 relative rounded-md shadow-sm max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      name="contractAmount"
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-slate-300 rounded-md py-3 border"
                      placeholder="2000000"
                      value={formData.contractAmount}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 sm:text-sm">円</span>
                    </div>
                  </div>
                </div>

                {/* 商材選択（複数選択） */}
                <div>
                  <span className="block text-sm font-medium text-slate-700 mb-2">商材情報（複数選択可） <span className="text-red-500">*</span></span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRODUCT_OPTIONS.map((option) => (
                      <label key={option.id} className={`
                        relative flex items-center p-3 rounded-lg border cursor-pointer transition-all
                        ${formData.selectedProducts.includes(option.id) 
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                          : 'bg-white border-slate-300 hover:bg-slate-50'}
                      `}>
                        <input
                          type="checkbox"
                          name="products"
                          value={option.id}
                          checked={formData.selectedProducts.includes(option.id)}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <span className="ml-3 text-sm font-medium text-slate-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* --- 条件付き表示エリア: 商材詳細 --- */}
                <div className="space-y-4 border-t border-slate-200 pt-4 mt-4">
                  
                  {/* ソーラーパネル詳細 */}
                  {formData.selectedProducts.includes('solar') && (
                    <div className="bg-white p-4 rounded-md border border-yellow-200 shadow-sm animate-fade-in-up">
                      <h4 className="font-bold text-yellow-700 mb-3 flex items-center"><Sun className="w-4 h-4 mr-1"/> ソーラーパネル詳細</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500">メーカー名</label>
                          <input type="text" name="solarManufacturer" value={formData.solarManufacturer} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border p-2" placeholder="例：Qセルズ" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500">システム容量 (kW)</label>
                          <input type="number" step="0.01" name="solarCapacity" value={formData.solarCapacity} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border p-2" placeholder="例：5.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 蓄電池詳細 */}
                  {formData.selectedProducts.includes('battery') && (
                    <div className="bg-white p-4 rounded-md border border-green-200 shadow-sm animate-fade-in-up">
                      <h4 className="font-bold text-green-700 mb-3 flex items-center"><BatteryCharging className="w-4 h-4 mr-1"/> 蓄電池詳細</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500">メーカー名</label>
                          <input type="text" name="batteryManufacturer" value={formData.batteryManufacturer} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm border p-2" placeholder="例：ニチコン" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500">蓄電容量 (kWh)</label>
                          <input type="number" step="0.01" name="batteryCapacity" value={formData.batteryCapacity} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm border p-2" placeholder="例：9.8" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* エコキュート詳細 */}
                  {formData.selectedProducts.includes('ecocute') && (
                    <div className="bg-white p-4 rounded-md border border-blue-200 shadow-sm animate-fade-in-up">
                      <h4 className="font-bold text-blue-700 mb-3 flex items-center"><Home className="w-4 h-4 mr-1"/> エコキュート詳細</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500">メーカー名</label>
                          <input type="text" name="ecoCuteManufacturer" value={formData.ecoCuteManufacturer} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" placeholder="例：ダイキン" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500">タンク容量 (L)</label>
                          <input type="number" name="ecoCuteCapacity" value={formData.ecoCuteCapacity} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" placeholder="例：370" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* V2H詳細 */}
                  {formData.selectedProducts.includes('v2h') && (
                    <div className="bg-white p-4 rounded-md border border-indigo-200 shadow-sm animate-fade-in-up">
                      <h4 className="font-bold text-indigo-700 mb-3 flex items-center"><Zap className="w-4 h-4 mr-1"/> V2H詳細</h4>
                      <div>
                        <label className="block text-xs font-medium text-slate-500">メーカー名</label>
                        <input type="text" name="v2hManufacturer" value={formData.v2hManufacturer} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border p-2" placeholder="例：ニチコン" />
                      </div>
                    </div>
                  )}

                  {/* IH詳細 */}
                  {formData.selectedProducts.includes('ih') && (
                    <div className="bg-white p-4 rounded-md border border-red-200 shadow-sm animate-fade-in-up">
                      <h4 className="font-bold text-red-700 mb-3 flex items-center"><Zap className="w-4 h-4 mr-1"/> IH詳細</h4>
                      <div>
                        <label className="block text-xs font-medium text-slate-500">メーカー名</label>
                        <input type="text" name="ihManufacturer" value={formData.ihManufacturer} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm border p-2" placeholder="例：パナソニック" />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* セクション3: 担当者・施工情報 */}
              <div className="p-6 sm:p-8 space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
                  担当・施工情報
                </h3>

                {/* 担当者名 */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">AP担当者名 <span className="text-red-500">*</span></label>
                    <input type="text" name="apStaffName" required value={formData.apStaffName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border py-3 px-3" placeholder="アポインター名" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">CL担当者名 <span className="text-red-500">*</span></label>
                    <input type="text" name="clStaffName" required value={formData.clStaffName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border py-3 px-3" placeholder="クローザー名" />
                  </div>
                </div>

                <div className="border-t border-slate-200 my-4"></div>

                {/* スケジュール情報 */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* 現調日 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 flex items-center">
                      <Wrench className="w-4 h-4 mr-1 text-slate-400" /> 現調日 (日時)
                    </label>
                    <input
                      type="datetime-local"
                      name="surveyDate"
                      className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border py-2 px-3"
                      value={formData.surveyDate}
                      onChange={handleChange}
                    />
                  </div>

                  {/* 施工日 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-slate-400" /> 施工日 (日時)
                      </label>
                      <div className="flex items-center">
                        <input
                          id="isConstructionUndecided"
                          name="isConstructionUndecided"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          checked={formData.isConstructionUndecided}
                          onChange={handleChange}
                        />
                        <label htmlFor="isConstructionUndecided" className="ml-2 block text-xs text-slate-500 cursor-pointer">
                          未定の場合はチェック
                        </label>
                      </div>
                    </div>
                    <input
                      type="datetime-local"
                      name="constructionDate"
                      disabled={formData.isConstructionUndecided}
                      className={`mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border py-2 px-3 ${formData.isConstructionUndecided ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                      value={formData.constructionDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 備考 */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-700">備考・特記事項</label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-slate-300 rounded-md p-3"
                      placeholder="その他共有事項があればご記入ください"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* エラーメッセージ */}
              {status === 'error' && (
                <div className="p-4 bg-red-50">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                      <div className="mt-2 text-sm text-red-700">{errorMessage}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* フッター（送信ボタン） */}
              <div className="px-6 py-8 bg-slate-50 sm:px-10 flex justify-end rounded-b-2xl">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full sm:w-auto inline-flex justify-center items-center py-4 px-8 border border-transparent shadow-lg text-lg font-bold rounded-full text-white transition-all transform hover:-translate-y-0.5
                    ${status === 'loading' 
                      ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      契約を確定・報告する
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">
            営業管理システム © 2025 Solar Sales Co.
          </p>
        </div>
      </div>
    </div>
  );
}

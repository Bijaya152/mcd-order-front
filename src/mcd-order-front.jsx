import React, { useState, useEffect } from "react";

// ==========================================
// 設定フラグ
// ==========================================
const useMock = false; // true: モックモード(バックエンド不要), false: 本番API通信
const itemsPerPage = 3; // 1ページあたりのメニュー表示件数

// ==========================================
// メニュー設定配列 (学生が自由に変更・追加可能)
// ==========================================
const menus = [
  {
    id: 1,
    name: "ハンバーガー",
    price: 200,
    image: "/images/image01.png",
    description: "定番のハンバーガー"
  },
  {
    id: 2,
    name: "チーズバーガー",
    price: 250,
    image: "/images/image02.png",
    description: "チーズ入りの人気メニュー"
  },
  {
    id: 3,
    name: "ダブルバーガー",
    price: 350,
    image: "/images/image03.png",
    description: "ボリューム満点のバーガー"
  },
  {
    id: 4,
    name: "ポテト",
    price: 180,
    image: "/images/image04.png",
    description: "サイドメニュー"
  },
  {
    id: 5,
    name: "コーラ",
    price: 150,
    image: "/images/image05.png",
    description: "ドリンク"
  }
];

// ==========================================
// インラインスタイル定義
// ==========================================
const styles = {
  container: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
    color: "#333"
  },
  title: {
    fontSize: "32px",
    color: "#da291c", // ハンバーガー店風の赤色
    marginBottom: "20px"
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
    margin: "20px 0"
  },
  card: {
    border: "2px solid #f4c430", // ハンバーガー店風の黄色
    borderRadius: "12px",
    padding: "15px",
    width: "220px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    backgroundColor: "#fff"
  },
  imageArea: {
    width: "100%",
    height: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eee",
    borderRadius: "8px",
    marginBottom: "10px",
    fontWeight: "bold",
    color: "#666"
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "8px"
  },
  input: {
    fontSize: "18px",
    padding: "10px",
    width: "80%",
    maxWidth: "300px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  button: {
    fontSize: "18px",
    fontWeight: "bold",
    padding: "12px 24px",
    margin: "10px",
    cursor: "pointer",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#da291c",
    color: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
  },
  buttonSecondary: {
    fontSize: "18px",
    fontWeight: "bold",
    padding: "12px 24px",
    margin: "10px",
    cursor: "pointer",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#666",
    color: "#fff"
  },
  qtyButton: {
    fontSize: "20px",
    padding: "5px 15px",
    margin: "0 5px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "1px solid #ccc"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    margin: "20px 0",
    fontSize: "18px"
  },
  th: {
    backgroundColor: "#f4c430",
    padding: "12px",
    borderBottom: "2px solid #ccc"
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee"
  }
};

export default function McdOrderFront() {
  // 画面状態: 0=初期設定, 1=メニュー選択, 2=注文確認, 3=注文完了, 4=エラー
  const [screen, setScreen] = useState(0);
  
  // 初期設定入力用
  const [serverUrl, setServerUrl] = useState("");
  const [terminalNo, setTerminalNo] = useState("");
  
  // 選択データ { menuId: quantity }
  const [selectedItems, setSelectedItems] = useState({});
  
  // ページング
  const [currentPage, setCurrentPage] = useState(1);
  
  // 画像エラー管理 { menuId: true }
  const [imageErrors, setImageErrors] = useState({});
  
  // エラーメッセージ
  const [errorMessage, setErrorMessage] = useState("");
  
  // 注文完了レスポンスデータ
  const [orderResponse, setOrderResponse] = useState(null);

  // 画面切り替え時に最上部へスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // 初期設定のロード
  useEffect(() => {
    const savedUrl = localStorage.getItem("serverUrl");
    const savedTerminal = localStorage.getItem("terminalNo");
    if (savedUrl) setServerUrl(savedUrl);
    if (savedTerminal) setTerminalNo(savedTerminal);
  }, []);

  // 共通エラー遷移関数
  const triggerError = (msg) => {
    setErrorMessage(msg);
    setScreen(4);
  };

  // 1. 初期設定画面のバリデーションと保存
  const handleSaveSettings = () => {
    if (!serverUrl.trim()) {
      triggerError("接続先IPアドレスが未入力です。");
      return;
    }
    if (!terminalNo.trim()) {
      triggerError("端末番号が未入力です。");
      return;
    }
    if (!/^https?:\/\//.test(serverUrl)) {
      triggerError("接続先IPアドレスは http:// または https:// から始めてください。");
      return;
    }

    localStorage.setItem("serverUrl", serverUrl.trim());
    localStorage.setItem("terminalNo", terminalNo.trim());
    setScreen(1); // メニュー選択画面へ
  };

  // 数量操作ヘルパー
  const handleSelectItem = (id) => {
    setSelectedItems(prev => ({ ...prev, [id]: 1 }));
  };

  const handleDeselectItem = (id) => {
    const updated = { ...selectedItems };
    delete updated[id];
    setSelectedItems(updated);
  };

  const changeQty = (id, delta) => {
    const currentQty = selectedItems[id] || 0;
    const newQty = currentQty + delta;
    if (newQty >= 1 && newQty <= 5) {
      setSelectedItems(prev => ({ ...prev, [id]: newQty }));
    }
  };

  // 画像エラーハンドラー
  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // 注文確認へ進む
  const handleGoToConfirm = () => {
    if (Object.keys(selectedItems).length === 0) {
      triggerError("メニュー選択が1つもありません。注文を選んでください。");
      return;
    }
    setScreen(2);
  };

  // 合計金額計算
  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const item = menus.find(m => m.id === parseInt(id));
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  // 注文確定（API送信 / モック）
  const handleConfirmOrder = async () => {
    const baseUrl = serverUrl.replace(/\/$/, "");
    const apiUrl = `${baseUrl}/api/orders`;
    const totalAmount = calculateTotal();

    // 送信JSONデータの組み立て
    const orderData = {
      terminalNo: terminalNo,
      messageType: "ORDER_CONFIRM",
      totalAmount: totalAmount,
      items: Object.entries(selectedItems).map(([id, qty]) => {
        const item = menus.find(m => m.id === parseInt(id));
        return {
          menuName: item ? item.name : "不明な商品",
          unitPrice: item ? item.price : 0,
          quantity: qty
        };
      })
    };

    if (useMock) {
      // --- モックモード挙動 ---
      console.log("===== Mock API送信開始 =====");
      console.log("送信先URL:", apiUrl);
      console.log("HTTPメソッド:", "POST");
      console.log("送信JSON\n", JSON.stringify(orderData, null, 2));
      console.log("===== Mock API送信終了 =====");

      // 固定の成功レスポンスをシミュレート
      const mockResponse = {
        result: "OK",
        orderNo: "0424-001",
        orderStatus: "オーダー受信",
        totalAmount: orderData.totalAmount,
        message: "注文を受け付けました"
      };

      setOrderResponse(mockResponse);
      setScreen(3); // 注文完了画面へ
    } else {
      // --- 実API通信モード ---
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          throw new Error(`サーバーエラー: ${response.status}`);
        }

        const data = await response.json();
        if (data.result === "OK") {
          setOrderResponse(data);
          setScreen(3);
        } else {
          triggerError(data.message || "バックエンドからエラーが返されました。");
        }
      } catch (err) {
        triggerError(`API通信に失敗しました。: ${err.message}`);
      }
    }
  };

  // ==========================================
  // 各画面のレンダリング
  // ==========================================

  // (0) 初期設定画面
  const renderSetup = () => (
    <div>
      <h2>初期設定</h2>
      <div style={{ margin: "20px" }}>
        <label style={{ display: "block", fontWeight: "bold" }}>接続先IPアドレス：</label>
        <input
          type="text"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          placeholder="http://localhost:8080"
          style={styles.input}
        />
      </div>
      <div style={{ margin: "20px" }}>
        <label style={{ display: "block", fontWeight: "bold" }}>端末番号：</label>
        <input
          type="text"
          value={terminalNo}
          onChange={(e) => setTerminalNo(e.target.value)}
          placeholder="25s99-1"
          style={styles.input}
        />
      </div>
      <button onClick={handleSaveSettings} style={styles.button}>設定する</button>
    </div>
  );

  // (1) メニュー選択画面
  const renderMenuSelection = () => {
    // ページネーション計算
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMenus = menus.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(menus.length / itemsPerPage);

    return (
      <div>
        <h2>メニュー選択</h2>
        <div style={styles.cardContainer}>
          {currentMenus.map(item => {
            const isSelected = selectedItems[item.id] !== undefined;
            const quantity = selectedItems[item.id] || 0;
            const subtotal = item.price * quantity;

            return (
              <div key={item.id} style={styles.card}>
                {/* 画像表示エリア */}
                <div style={styles.imageArea}>
                  {imageErrors[item.id] ? (
                    <span>画像なし</span>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={styles.styles?.image || styles.image}
                      onError={() => handleImageError(item.id)}
                    />
                  )}
                </div>

                <h3>{item.name}</h3>
                <p style={{ fontSize: "14px", color: "#666" }}>{item.description}</p>
                <p style={{ fontWeight: "bold", fontSize: "18px" }}>価格: {item.price}円</p>

                {!isSelected ? (
                  <button onClick={() => handleSelectItem(item.id)} style={styles.button}>選択</button>
                ) : (
                  <div>
                    <div style={{ margin: "10px 0" }}>
                      <button onClick={() => changeQty(item.id, -1)} style={styles.qtyButton}>-</button>
                      <span style={{ fontSize: "20px", fontWeight: "bold", margin: "0 10px" }}>{quantity}</span>
                      <button onClick={() => changeQty(item.id, 1)} style={styles.qtyButton}>+</button>
                    </div>
                    <p style={{ fontWeight: "bold" }}>小計: {subtotal}円</p>
                    <button onClick={() => handleDeselectItem(item.id)} style={styles.buttonSecondary}>選択解除</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ページコントロール */}
        <div style={{ margin: "20px" }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={currentPage === 1 ? { ...styles.buttonSecondary, opacity: 0.5, cursor: "not-allowed" } : styles.buttonSecondary}
          >
            前へ
          </button>
          <span style={{ fontSize: "18px", margin: "0 15px", fontWeight: "bold" }}>
            {currentPage} / {totalPages} ページ
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={currentPage === totalPages ? { ...styles.buttonSecondary, opacity: 0.5, cursor: "not-allowed" } : styles.buttonSecondary}
          >
            次へ
          </button>
        </div>

        <hr style={{ margin: "30px 0", border: "1px solid #eee" }} />
        <button onClick={handleGoToConfirm} style={{ ...styles.button, backgroundColor: "#4CAF50", fontSize: "22px" }}>
          注文確認へ進む
        </button>
      </div>
    );
  };

  // (2) 注文確認画面
  const renderConfirmation = () => {
    const totalAmount = calculateTotal();

    return (
      <div>
        <h2>注文内容の確認</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>メニュー名</th>
              <th style={styles.th}>単価</th>
              <th style={styles.th}>数量</th>
              <th style={styles.th}>小計</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(selectedItems).map(([id, qty]) => {
              const item = menus.find(m => m.id === parseInt(id));
              if (!item) return null;
              return (
                <tr key={id}>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.price}円</td>
                  <td style={styles.td}>{qty}</td>
                  <td style={styles.td}>{item.price * qty}円</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <h3 style={{ fontSize: "26px", color: "#da291c", textAlign: "right", marginRight: "20px" }}>
          合計金額: {totalAmount}円
        </h3>

        <div style={{ marginTop: "30px" }}>
          <button onClick={() => setScreen(1)} style={styles.buttonSecondary}>選択画面に戻る</button>
          <button onClick={handleConfirmOrder} style={{ ...styles.button, backgroundColor: "#4CAF50" }}>注文確定</button>
        </div>
      </div>
    );
  };

  // (3) 注文完了画面
  const renderSuccess = () => (
    <div>
      <h2 style={{ color: "#4CAF50", fontSize: "28px" }}>✓ 注文が完了しました</h2>
      {orderResponse && (
        <div style={{ margin: "30px 0", padding: "20px", border: "2px solid #4CAF50", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
          <p style={{ fontSize: "22px", fontWeight: "bold" }}>注文番号: {orderResponse.orderNo}</p>
          <p style={{ fontSize: "22px", fontWeight: "bold" }}>合計金額: {orderResponse.totalAmount}円</p>
          <p style={{ fontSize: "18px", marginTop: "10px", color: "#555" }}>{orderResponse.message}</p>
        </div>
      )}
      <button
        onClick={() => {
          setSelectedItems({});
          setScreen(1);
        }}
        style={styles.button}
      >
        続けて注文する
      </button>
    </div>
  );

  // (4) エラー画面
  const renderError = () => (
    <div>
      <h2 style={{ color: "#da291c", fontSize: "28px" }}>⚠ エラーが発生しました</h2>
      <p style={{ fontSize: "20px", margin: "20px", color: "#ff0000", fontWeight: "bold" }}>
        {errorMessage}
      </p>
      <div style={{ marginTop: "30px" }}>
        <button onClick={() => setScreen(1)} style={styles.button}>メニュー選択画面へ戻る</button>
        <button onClick={() => setScreen(0)} style={styles.buttonSecondary}>初期設定画面へ戻る</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>SUBASHハンバーガー屋さん</h1>
      <hr style={{ marginBottom: "25px", border: "1px solid #f4c430" }} />
      
      {screen === 0 && renderSetup()}
      {screen === 1 && renderMenuSelection()}
      {screen === 2 && renderConfirmation()}
      {screen === 3 && renderSuccess()}
      {screen === 4 && renderError()}
    </div>
  );
}
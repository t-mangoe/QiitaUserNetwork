// ネットワークのノード
var nodes;
// ネットワークのエッジ
var edges;
// vis.jsのネットワーク
var network;
// ネットワーク図でのノードの番号。重複しないようにユーザに割り当てる
var nodeIdNumber;
// ユーザとノード番号を対応づけるマップ
var nodeIdMap;
// ノード間の位置。vis.jsのmassプロパティを設定
var mass;

// フォローしている/されているユーザをネットワーク図に追加
function AddUsersToNetwork(data,centerUserId,followerFlag){
    var nodes_length = nodes.length;
    var userArray = [];
    $.each(data,function(index,val){
        // ノードとエッジに情報を追加
        var addedUserId = val.id;
        if(!(addedUserId in nodeIdMap)){
            //ノードのIDを発行
            nodeIdMap[addedUserId] = nodeIdNumber;
            nodeIdNumber++;
            var node = {id: nodeIdMap[addedUserId], label:addedUserId, shape:'image', image:val.profile_image_url, mass: mass};
            node["title"] = val.name ? val.name : addedUserId;
            nodes.add(node);
        }
        if(followerFlag){
            edges.add({from: nodeIdMap[addedUserId], to: nodeIdMap[centerUserId], arrows: 'to'});
        }else{
            edges.add({from: nodeIdMap[centerUserId], to: nodeIdMap[addedUserId], arrows: 'to'});
        }
    });
    network.redraw();
    network.stabilize();
}

function getFollowerInfo(userId){
    //フォローされているユーザの情報を取得
    $.ajax({
        url:'https://qiita.com/api/v2/users/' + userId + '/followers',
        success: function(data){
            AddUsersToNetwork(data,userId,true);
        },
        error: function(){
            alert("フォローされているユーザの取得中にエラーが発生しました");
        }
    });

}

function getFolloweeInfo(userId){
    //フォローしているユーザの情報を取得
    $.ajax({
        url:'https://qiita.com/api/v2/users/' + userId + '/followees',
        success: function(data){
            AddUsersToNetwork(data,userId,false);
        },
        error: function(){
            alert("フォローしているユーザの取得中にエラーが発生しました");
        }
    });

}

// depth: 入力されたユーザからのネットワークの深さの数値
function expandNetwork(userArray, depth){
    if(depth > 1) return;
    //if(nodeIdNumber > 5) return; // 終了条件
    userArray.forEach(function(userId){
        //getFollowerInfo(userId, depth+1);
        getFolloweeInfo(userId, depth+1);
    });
}

function createUserNetwork(){
    var userId = input_form.textbox.value;
    nodes = new vis.DataSet();
    edges = new vis.DataSet();
    nodeIdNumber = 0;
    nodeIdMap = new Object;
    mass = 3;
    // ネットワークのグラフを表示する要素の取得
    var container = document.getElementById('followers');
    var options = {
        nodes:{
            shape: 'image'
        }
    };
    network = new vis.Network(container,{nodes: nodes, edges: edges},options);
    // ネットワーク図がクリックされたときの処理
    network.on("click", function(params){
        if(params.nodes.length == 1){
            var nodeId = params.nodes[0];
            var node = nodes.get(nodeId);
            console.log(node.label + "がクリックされました");
        }
    });

    //自分のユーザ情報を取得
    $.ajax({
        url:'https://qiita.com/api/v2/users/' + userId,
        success: function(data){
            //自分をノードとして追加
            if(!(userId in nodeIdMap)){
                //ノードのIDを発行
                nodeIdMap[userId] = nodeIdNumber;
                nodeIdNumber++;
            }
            var node = {id:nodeIdMap[userId], label:userId, shape:'image', image:data.profile_image_url, mass: mass};
            node["title"] = "userId = " + userId;
            nodes.add(node);
            // expandNetwork([userId],0);
            getFollowerInfo(userId);
            getFolloweeInfo(userId);
        },
        error: function(){
            alert("指定されたユーザは存在しません");
        }
    });
}

window.onload = function(){
    //var param = location.search
    //console.log(param);
    var inputFormText = document.getElementById('input');
    console.log(inputFormText);
    inputFormText.addEventListener('submit', function(evt){
        // フォームを送信する代わりに、ネットワーク図を作成
        createUserNetwork();
        evt.preventDefault();
    });

};

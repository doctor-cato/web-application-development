function getPOSRealtimeShowtimes(m, st) { return st; }

    const grid = { classList: {remove:()=>{}}, style: {} };
    
    const movies = [{"id":"1","title":"Núi Tế Vong","poster":"test.jpg","duration":"120","age":"T16"}];
    const showtimes = [{"id":"s1","movieId":"1","time":"08:00","isPast":true,"cinemaName":"3HD2K CẦU GIẤY"},{"id":"s2","movieId":"1","time":"16:00","isPast":true,"cinemaName":"3HD2K CẦU GIẤY"}];
    
    // Aggressively force flex column for the wrapper
    grid.classList.remove("pos-grid");
    grid.style.display = "flex";
    grid.style.flexDirection = "column";
    grid.style.gap = "16px";
    
    // Inject CFD-like styles
    const styles = `
    <style id="cfd-mimic-styles">
        .cfd-card {
            background: rgba(20,20,20,0.6);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        